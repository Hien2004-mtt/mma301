require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const statisticsRoutes = require("./routes/statistics");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json());

// Phục vụ giao diện Web Admin tĩnh
app.use("/admin", express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/statistics", statisticsRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API Server MMA301 is running... Web Admin at /admin");
});

// WebSocket Server cho Chat Realtime
const wss = new WebSocket.Server({ server });

wss.on("connection", async (ws) => {
  console.log("Một người dùng kết nối WebSocket thành công");

  try {
    const history = await Message.find().sort({ createdAt: -1 }).limit(50);
    ws.send(JSON.stringify({ type: "history", data: history.reverse() }));
  } catch (err) {
    console.error("Lỗi tải lịch sử chat:", err);
  }

  ws.on("message", async (rawData) => {
    try {
      const parsed = JSON.parse(rawData);
      if (parsed.type === "message") {
        const { sender, senderName, senderRole, content } = parsed;

        const newMessage = new Message({
          sender,
          senderName,
          senderRole,
          content,
        });
        await newMessage.save();

        const broadcastPayload = JSON.stringify({
          type: "message",
          data: newMessage,
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(broadcastPayload);
          }
        });
      }
    } catch (err) {
      console.error("Lỗi xử lý tin nhắn socket:", err);
    }
  });

  ws.on("close", () => {
    console.log("Một người dùng đã ngắt kết nối WebSocket");
  });
});

// Kết nối MongoDB Atlas
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mma301?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Kết nối MongoDB Atlas thành công!");
    // Lắng nghe trên 0.0.0.0 để emulator và thiết bị khác truy cập được
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server đang chạy tại http://0.0.0.0:${PORT}`);
      console.log(`Giao diện Web Admin: http://localhost:${PORT}/admin`);
    });
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối cơ sở dữ liệu MongoDB Atlas:", err.message);
  });
