const mongoose = require("mongoose");

const ElectricianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String
    },
    area: {
      type: String
    },
    experience: {
      type: Number // in years
    },
    specialization: {
      type: String
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Electrician", ElectricianSchema);
