const express = require("express");
const router = express.Router();
const {
  getMpesaToken,
  initiateSTKPush,
  handleCallback,
} = require("../controllers/mpesaController");

router.post("/stkpush", getMpesaToken, initiateSTKPush);
router.post("/callback", handleCallback); // Public endpoint for ngrok

module.exports = router;
