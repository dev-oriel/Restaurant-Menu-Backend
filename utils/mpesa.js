const axios = require("axios");

const getAccessToken = async (req, res, next) => {
  try {
    const url =
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString("base64");

    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    req.token = response.data.access_token;
    next();
  } catch (error) {
    console.error("M-Pesa Token Error:", error.message);
    res.status(503).json({ message: "Payment service unavailable" });
  }
};

module.exports = { getAccessToken };
