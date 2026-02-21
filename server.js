const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Product = require("./models/Product");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 50000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined in .env file");
  process.exit(1);
}
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Allow image base64

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));


// 🧩 API Routes
// Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      modelName,
      type,
      capacity,
      mrp,
      discount,
      price,
      warranty,
      description,
      detailDescription,
      images, // Array of base64 strings
      isPopular,
      rank,
    } = req.body;

    console.log("Received product data:", req.isPopular);
    if (!name || !price || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Ensure `images` is always an array
    const imageArray = Array.isArray(images) ? images : images ? [images] : [];

    const product = new Product({
      name,
      modelName,
      type,
      capacity,
      mrp,
      discount,
      price,
      warranty,
      description,
      detailDescription,
      images: imageArray,
      isPopular,
      rank,
    });
    await product.save();
    res.status(201).json({ message: "✅ Product added successfully", product });
  } catch (err) {
    res.status(500).json({ message: "❌ Error adding product", error: err.message });
  }
});
// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a product
app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update product price
app.put("/api/products/:id", async (req, res) => {
  try {
    const {
      name,
      modelName,
      type,
      capacity,
      description,
      detailDescription,
      warranty,
      price,
      mrp,
      discount,
      images,
      isPopular,
      rank,
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        modelName,
        type,
        capacity,
        description,
        detailDescription,
        warranty,
        price,
        mrp,
        discount,
        images, 
        isPopular,
        rank,
      },
      { new: true, runValidators: true }
    );

    res.json(product);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Product update failed" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  // ✅ Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// Get products by category (type)
app.get("/api/products/category/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const products = await Product.find({
      type: { $regex: new RegExp(type, "i") }, // case insensitive
    });

    res.json(products);
  } catch (err) {
    console.error("Category fetch failed:", err);
    res.status(500).json({ message: "Failed to fetch products by category" });
  }
});

app.use("/api/leads", require("./routes/leadRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/electricians", require("./routes/electricianRoutes"));
app.use("/api/chatbot", require("./routes/ChatbotRoutes"));
// const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
