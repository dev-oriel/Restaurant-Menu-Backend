const express = require("express");
const router = express.Router();
const { authUser, signUp } = require("../controllers/authController");

router.post("/login", authUser);
router.post("/signup", signUp);

module.exports = router;
