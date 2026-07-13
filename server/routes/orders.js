const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { auth, authorize } = require("../middleware/auth");

// Tạo đơn hàng mới (Bất kỳ user đã đăng nhập)
router.post("/", auth, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({ message: "Giỏ hàng trống." });
    }

    const order = new Order({
      userId: req.user._id,
      products,
      totalAmount,
      status: "pending",
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo đơn hàng." });
  }
});

// Lấy lịch sử đơn hàng của chính user đang đăng nhập (Customer/Admin tự xem của mình)
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi tải đơn hàng cá nhân." });
  }
});

// Lấy toàn bộ đơn hàng của toàn bộ hệ thống (Chỉ Admin)
router.get("/", auth, authorize(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email phone address")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi tải tất cả đơn hàng." });
  }
});

// Cập nhật trạng thái đơn hàng (Chỉ Admin)
router.put("/:id/status", auth, authorize(["admin"]), async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["pending", "processing", "shipped", "cancelled"];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    order.status = status;
    await order.save();
    await order.populate("userId", "name email phone address");
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi cập nhật trạng thái đơn hàng." });
  }
});

module.exports = router;
