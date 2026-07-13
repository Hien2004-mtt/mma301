const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET || "mma301_secret_jwt_key_random_123456";

// Đăng ký tài khoản mới (Mặc định là customer)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    // Kiểm tra email tồn tại
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email này đã được đăng ký." });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo user mới
    user = new User({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
      address: address || "",
      role: role || "customer", // Mặc định là customer
    });

    await user.save();

    // Sinh JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng ký." });
  }
});

// Đăng nhập
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra user tồn tại
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Tài khoản hoặc mật khẩu không chính xác." });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Tài khoản hoặc mật khẩu không chính xác." });
    }

    // Sinh JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi đăng nhập." });
  }
});

// Lấy thông tin user hiện tại
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      address: req.user.address,
      role: req.user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

module.exports = router;
