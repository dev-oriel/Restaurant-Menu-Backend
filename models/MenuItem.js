const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., Mains, Drinks
  image: { type: String }, // Optional URL
});

module.exports = mongoose.model("MenuItem", menuItemSchema);
