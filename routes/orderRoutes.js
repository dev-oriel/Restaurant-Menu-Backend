const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getOrders,
  getOrderReceipt,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(createOrder).get(protect, admin, getOrders);
router.route("/:id").get(getOrderById);
router.route("/:id/receipt").get(getOrderReceipt);

module.exports = router;
