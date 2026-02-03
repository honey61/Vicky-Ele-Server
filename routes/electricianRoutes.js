const express = require("express");
const router = express.Router();
const Electrician = require("../models/Electrician");

/* ➕ Add Electrician */
router.post("/", async (req, res) => {
  try {
    const electrician = await Electrician.create(req.body);
    res.status(201).json(electrician);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* 📄 Get All Electricians */
router.get("/", async (req, res) => {
  try {
    const electricians = await Electrician.find().sort({ createdAt: -1 });
    res.json(electricians);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ✏️ Update Electrician */
router.put("/:id", async (req, res) => {
  try {
    const electrician = await Electrician.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(electrician);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* 🗑 Delete Electrician */
router.delete("/:id", async (req, res) => {
  try {
    await Electrician.findByIdAndDelete(req.params.id);
    res.json({ message: "Electrician deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
