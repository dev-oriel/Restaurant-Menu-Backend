const Order = require("../models/Order");
const axios = require("axios");
const PDFDocument = require("pdfkit");

// 1. Create Order & Initiate STK Push
exports.createOrder = async (req, res) => {
  try {
    const { tableNumber, items, totalAmount, phoneNumber } = req.body;

    // Create Order Record
    const order = new Order({
      tableNumber,
      items,
      totalAmount,
      customerPhone: phoneNumber,
    });
    await order.save();

    // M-Pesa Logic
    const date = new Date();
    const timestamp =
      date.getFullYear() +
      ("0" + (date.getMonth() + 1)).slice(-2) +
      ("0" + date.getDate()).slice(-2) +
      ("0" + date.getHours()).slice(-2) +
      ("0" + date.getMinutes()).slice(-2) +
      ("0" + date.getSeconds()).slice(-2);

    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const stkPayload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: 1, // FORCE 1 KES FOR TESTING
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.MPESA_CALLBACK_URL, // Using your ngrok url
      AccountReference: `Table ${tableNumber}`,
      TransactionDesc: "Food Order",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      stkPayload,
      { headers: { Authorization: `Bearer ${req.token}` } }
    );

    // Save CheckoutRequestID to Order
    order.mpesa.checkoutRequestID = response.data.CheckoutRequestID;
    order.mpesa.merchantRequestID = response.data.MerchantRequestID;
    await order.save();

    res.status(200).json({
      message: "STK Push Sent",
      orderId: order._id,
    });
  } catch (error) {
    console.error(
      "STK Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

// 2. Webhook Callback
exports.mpesaCallback = async (req, res) => {
  try {
    const { Body } = req.body;
    const stkCallback = Body.stkCallback;

    console.log("M-Pesa Callback:", JSON.stringify(stkCallback));

    const order = await Order.findOne({
      "mpesa.checkoutRequestID": stkCallback.CheckoutRequestID,
    });
    if (!order) return res.json({ result: "Order not found" });

    if (stkCallback.ResultCode === 0) {
      // Payment Success
      const meta = stkCallback.CallbackMetadata.Item;
      const receipt = meta.find((i) => i.Name === "MpesaReceiptNumber").Value;

      order.status = "PAID";
      order.mpesa.receiptNumber = receipt;
      await order.save();

      // Notify Frontend via Socket
      req.io.emit("order_update", {
        type: "PAYMENT_SUCCESS",
        orderId: order._id,
        table: order.tableNumber,
        items: order.items,
      });
    } else {
      order.status = "FAILED";
      await order.save();
    }

    res.json({ result: "ok" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
};

// 3. Receipt Generation
exports.getReceipt = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.status !== "PAID")
    return res.status(400).send("Invalid Order");

  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=receipt-${order.mpesa.receiptNumber}.pdf`
  );

  doc.pipe(res);
  doc.fontSize(20).text("Restaurant Receipt", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Receipt #: ${order.mpesa.receiptNumber}`);
  doc.text(`Date: ${order.createdAt.toLocaleString()}`);
  doc.moveDown();

  order.items.forEach((item) => {
    doc.text(
      `${item.name} x ${item.quantity} ... KES ${item.price * item.quantity}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total: KES ${order.totalAmount}`, { bold: true });
  doc.end();
};
