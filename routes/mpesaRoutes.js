const express = require("express");
const router = express.Router();
const {
  getAccessToken,
  initiateSTKPush,
  handleCallback,
} = require("../controllers/mpesaController");

router.post("/pay", getAccessToken, initiateSTKPush);
router.post("/callback", handleCallback);

module.exports = router;
