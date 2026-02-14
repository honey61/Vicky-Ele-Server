const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mrp: { type: Number, required: true },
  modelName: { type: String },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  type: { type: String, required: true },
  capacity: { type: String },
  warranty: { type: String },
  description: { type: String },
  images: [String], // Store image filename
  isPopular: { type: Boolean, default: false },

  // ✅ Rank Option Set Added
  rank: {
    type: String,
    enum: [
      "Most Recommended",
      "Recommended",
      "Average",
      "Less Recommended"
    ],
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
