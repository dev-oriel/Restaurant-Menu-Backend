const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const mpesaRoutes = require("./routes/mpesaRoutes");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Socket.io Setup (CORS is needed for frontend connection)
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});

// Middleware
app.use(cors());
app.use(express.json());

// Inject 'io' into req object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Routes
app.use("/api/mpesa", mpesaRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
