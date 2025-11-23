const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    tableNumber: { type: String, required: true },
    items: [
      {
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    customerPhone: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    mpesa: {
      checkoutRequestID: String,
      merchantRequestID: String,
      receiptNumber: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
