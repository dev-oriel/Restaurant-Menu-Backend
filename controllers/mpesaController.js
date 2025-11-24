const axios = require("axios");
const moment = require("moment");
const Order = require("../models/Order");

// Middleware to generate OAuth token
const getMpesaToken = async (req, res, next) => {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64"
  );

  try {
    const { data } = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    req.token = data.access_token;
    next();
  } catch (error) {
    console.error(
      "Token Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to generate M-Pesa token" });
  }
};

// Initiate STK Push
const initiateSTKPush = async (req, res) => {
  const { phone, amount, orderId } = req.body;
  const token = req.token;

  // Format phone (Must be 254...)
  const formattedPhone = phone.startsWith("0") ? "254" + phone.slice(1) : phone;

  const timestamp = moment().format("YYYYMMDDHHmmss");
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const password = Buffer.from(shortcode + passkey + timestamp).toString(
    "base64"
  );

  try {
    const { data } = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.floor(amount), // Sandbox doesn't like decimals sometimes
        PartyA: formattedPhone,
        PartyB: shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "Restaurant",
        TransactionDesc: `Order ${orderId}`,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Update Order with CheckoutRequestID
    const order = await Order.findById(orderId);
    if (order) {
      order.checkoutRequestID = data.CheckoutRequestID;
      order.paymentStatus = "PENDING";
      await order.save();
    }

    res.status(200).json(data);
  } catch (error) {
    console.error(
      "STK Push Error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "STK Push Failed" });
  }
};

// Handle Callback from M-Pesa
const handleCallback = async (req, res) => {
  console.log("--- M-Pesa Callback Received ---");

  const { Body } = req.body;

  if (!Body || !Body.stkCallback) {
    console.log("Invalid callback payload");
    return res.status(400).send("Invalid payload");
  }

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = Body.stkCallback;

  try {
    const order = await Order.findOne({ checkoutRequestID: CheckoutRequestID });

    if (!order) {
      console.log(`Order not found for CheckoutID: ${CheckoutRequestID}`);
      return res.json({ result: "Order not found" });
    }

    if (ResultCode === 0) {
      // Payment Successful
      const mpesaReceipt = CallbackMetadata.Item.find(
        (item) => item.Name === "MpesaReceiptNumber"
      ).Value;

      order.paymentStatus = "PAID";
      order.mpesaReceiptNumber = mpesaReceipt;
      await order.save();

      // Emit Socket Event to Frontend (both specific order room and admin dashboard)
      req.io
        .to(order._id.toString())
        .emit("payment_status", { status: "PAID", order });
      req.io.emit("new_order_paid", order); // For Admin Dashboard
      console.log(`Order ${order._id} PAID.`);
    } else {
      // Payment Failed/Cancelled
      order.paymentStatus = "FAILED";
      await order.save();
      req.io
        .to(order._id.toString())
        .emit("payment_status", { status: "FAILED" });
      console.log(`Order ${order._id} FAILED.`);
    }

    res.json({ result: "Callback processed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Callback processing failed" });
  }
};

module.exports = { getMpesaToken, initiateSTKPush, handleCallback };
