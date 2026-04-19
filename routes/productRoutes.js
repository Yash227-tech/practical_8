const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs-extra");
const path = require("path");

// Multer storage for temporary local file saving before Cloudinary upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Add product (with Cloudinary integration)
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "hotwheels_collection",
      use_filename: true
    });

    // Create product with Cloudinary URL
    const product = new Product({
      name: req.body.name,
      price: req.body.price,
      image: result.secure_url, // Store the Cloudinary secure URL
      category: req.body.category || "General"
    });

    await product.save();

    // Remove file from local uploads folder
    await fs.remove(req.file.path);

    res.status(201).json(product);
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    res.status(500).json({ error: "Image upload failed", details: err.message });
  }
});

// Get products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

module.exports = router;
