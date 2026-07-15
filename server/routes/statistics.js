const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { auth, authorize } = require("../middleware/auth");

// Lấy thông tin thống kê tổng quan (Chỉ Admin)
router.get("/", auth, authorize(["admin"]), async (req, res) => {
  try {
    // 1. Tổng doanh thu (không tính đơn hàng bị huỷ)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // 2. Tổng số đơn hàng
    const totalOrders = await Order.countDocuments();

    // 3. Tổng số sản phẩm
    const totalProducts = await Product.countDocuments();

    // 4. Tổng số người dùng
    const totalUsers = await User.countDocuments();
    const customersCount = await User.countDocuments({ role: "customer" });
    const adminsCount = await User.countDocuments({ role: "admin" });

    // 5. Thống kê số lượng đơn hàng theo trạng thái
    const orderStats = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      cancelled: 0,
    };
    orderStats.forEach((stat) => {
      if (statusCounts[stat._id] !== undefined) {
        statusCounts[stat._id] = stat.count;
      }
    });

    // 6. Thống kê doanh thu theo tháng (6 tháng gần nhất)
    const monthlySales = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]);

    // Format kết quả doanh thu tháng
    const formattedMonthlySales = monthlySales
      .map((item) => ({
        month: `${item._id.month}/${item._id.year}`,
        revenue: item.revenue,
      }))
      .reverse();

    // 7. Lấy 5 đơn hàng mới nhất để hiển thị ở dashboard
    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      usersBreakdown: {
        customers: customersCount,
        admins: adminsCount,
      },
      statusCounts,
      monthlySales: formattedMonthlySales,
      recentOrders,
    });
  } catch (error) {
    console.error("Lỗi khi lấy số liệu thống kê:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi tải dữ liệu thống kê." });
  }
});

module.exports = router;
