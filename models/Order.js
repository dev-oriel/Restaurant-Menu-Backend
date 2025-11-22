const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  mpesaReceiptNumber: { type: String },
  checkoutRequestID: { type: String },
  status: { type: String, enum: ['PENDING', 'PAID', 'FAILED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);