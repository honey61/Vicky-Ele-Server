const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    product: { type: String },
    status: {
      type: String,
      enum: ["New", "Contacted", "Interested", "Closed"],
      default: "New"
    },
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
