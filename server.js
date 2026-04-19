const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;
const Stripe = require("stripe");

dotenv.config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Root route
app.get("/", (req, res) => {
  res.send("API Running");
});

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// Product routes
app.use("/api/products", require("./routes/productRoutes"));

// Serve static frontend files from the root directory
app.use(express.static(__dirname));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Mock Payment API
app.post("/api/payment", (req, res) => {
  const { amount } = req.body;
  if (amount > 0) {
    res.json({ status: "success" });
  } else {
    res.status(400).json({ status: "failed" });
  }
});

// Stripe Checkout Session API (Redirect Flow)
app.post("/api/stripe-checkout", async (req, res) => {
  try {
    const { amount, items } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "HotWheels Collection Purchase",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:5000/checkout.html?status=success`,
      cancel_url: `http://localhost:5000/checkout.html?status=cancel`,
    });

    res.json({ success: true, url: session.url });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Original PaymentIntent API (kept for compatibility)
app.post("/api/stripe-payment", async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      payment_method_types: ["card"]
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cloudinary image upload endpoint
app.post("/api/upload", async (req, res) => {
  try {
    const { image } = req.body;
    const result = await cloudinary.uploader.upload(image, {
      folder: "practical8"
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server started on port " + PORT));
