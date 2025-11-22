const axios = require("axios");
const Order = require("../models/Order");

// Middleware to generate M-Pesa Access Token
const getAccessToken = async (req, res, next) => {
  const consumer_key = process.env.MPESA_CONSUMER_KEY;
  const consumer_secret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumer_key}:${consumer_secret}`).toString(
    "base64"
  );

  try {
    const response = await axios.get(
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
      { headers: { Authorization: `Basic ${auth}` } }
    );
    req.token = response.data.access_token;
    next();
  } catch (error) {
    console.error("Token Error:", error);
    res.status(400).json({ message: "Access Token Generation Failed" });
  }
};

// 1. Initiate STK Push
const initiateSTKPush = async (req, res) => {
  const { phoneNumber, amount, tableNumber, items } = req.body;
  const token = req.token;

  // Generate Timestamp and Password
  const date = new Date();
  const timestamp =
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);

  const shortCode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const password = Buffer.from(shortCode + passkey + timestamp).toString(
    "base64"
  );

  try {
    const stkResponse = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: shortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: `Table ${tableNumber}`,
        TransactionDesc: "Food Order",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Create a PENDING order in DB
    const newOrder = new Order({
      tableNumber,
      items,
      totalAmount: amount,
      phoneNumber,
      checkoutRequestID: stkResponse.data.CheckoutRequestID,
      status: "PENDING",
    });
    await newOrder.save();

    res.status(200).json({
      message: "STK Push Sent",
      checkoutID: stkResponse.data.CheckoutRequestID,
    });
  } catch (error) {
    console.error("STK Error:", error.response ? error.response.data : error);
    res.status(500).json({ message: "STK Push Failed" });
  }
};

// 2. Handle Callback (The most critical part)
const handleCallback = async (req, res) => {
  // Safaricom expects a 200 OK immediately
  res.status(200).json({ result: "ok" });

  const callbackData = req.body.Body.stkCallback;
  const checkoutID = callbackData.CheckoutRequestID;

  if (callbackData.ResultCode === 0) {
    // Payment Successful
    const meta = callbackData.CallbackMetadata.Item;
    const mpesaReceipt = meta.find(
      (o) => o.Name === "MpesaReceiptNumber"
    ).Value;

    // Update DB
    const updatedOrder = await Order.findOneAndUpdate(
      { checkoutRequestID: checkoutID },
      { status: "PAID", mpesaReceiptNumber: mpesaReceipt },
      { new: true }
    );

    // EMIT SOCKET EVENT to Frontend (Kitchen & Customer)
    if (req.io) {
      req.io.emit("payment_success", {
        orderId: updatedOrder._id,
        table: updatedOrder.tableNumber,
        status: "PAID",
      });
    }

    console.log(`Order Paid: ${mpesaReceipt}`);
  } else {
    // Payment Failed
    await Order.findOneAndUpdate(
      { checkoutRequestID: checkoutID },
      { status: "FAILED" }
    );
    console.log("Payment Failed/Cancelled");
  }
};

module.exports = { getAccessToken, initiateSTKPush, handleCallback };
