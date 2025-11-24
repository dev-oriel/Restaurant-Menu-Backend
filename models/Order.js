const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    tableNumber: { type: String, required: true },
    customerPhone: { type: String, required: true },
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    totalPrice: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    checkoutRequestID: { type: String }, // M-Pesa specific
    mpesaReceiptNumber: { type: String },
    status: {
      type: String,
      enum: ["New", "Cooking", "Ready", "Served"],
      default: "New",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
