const express = require("express");
const router = express.Router();
const multer = require("multer");
const Product = require("../models/Product");

// 📦 Setup multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

// ➕ Add product
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, mrp, price, discount, type, capacity, warranty, description } = req.body;
    const image = req.file ? req.file.filename : null;

    const product = new Product({
      name,
      mrp,
      price,
      discount,
      type,
      capacity,
      warranty,
      description,
      image,
      isPopular,
    });

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while adding product" });
  }
});

// 📜 Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error while fetching products" });
  }
});

// 🗑 Delete a product
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error while deleting product" });
  }
});

module.exports = router;
