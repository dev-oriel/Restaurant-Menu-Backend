const Order = require("../models/Order");
const { generateReceipt } = require("../utils/pdfGenerator");

const createOrder = async (req, res) => {
  const { orderItems, totalPrice, tableNumber, customerPhone } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: "No order items" });
  }

  const order = new Order({
    orderItems,
    totalPrice,
    tableNumber,
    customerPhone,
    paymentStatus: "PENDING",
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "orderItems.product",
    "name image"
  );
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

const getOrders = async (req, res) => {
  // For Admin
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
};

const getOrderReceipt = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order && order.paymentStatus === "PAID") {
    generateReceipt(order, res);
  } else {
    res
      .status(400)
      .json({ message: "Receipt not available (Unpaid or Not Found)" });
  }
};

module.exports = { createOrder, getOrderById, getOrders, getOrderReceipt };
