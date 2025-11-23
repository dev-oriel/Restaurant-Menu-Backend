require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const { getAccessToken } = require("./utils/mpesa");
const orderController = require("./controllers/orderController");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.io Setup
const io = new Server(server, {
  cors: { origin: "*" }, // Allow all origins for local dev
});

// Inject io into request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.get("/", (req, res) => res.send("Restaurant API Running"));

// Order Routes
app.post("/api/orders", getAccessToken, orderController.createOrder);
app.post("/api/mpesa/callback", orderController.mpesaCallback);
app.get("/api/orders/:id/receipt", orderController.getReceipt);

// Mock Menu Route (Simplify for skeleton)
app.get("/api/menu", (req, res) => {
  res.json([
    { _id: "1", name: "Kuku Choma", price: 1200, category: "Mains" },
    { _id: "2", name: "Sukuma Wiki", price: 100, category: "Sides" },
    { _id: "3", name: "Ugali", price: 80, category: "Sides" },
  ]);
});

// DB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

// Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
