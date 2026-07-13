const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware xác thực token JWT
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Không tìm thấy token xác thực. Truy cập bị từ chối." });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mma301_secret_jwt_key_random_123456");
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại." });
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

// Middleware kiểm tra quyền truy cập (theo role)
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Yêu cầu đăng nhập." });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện hành động này." });
    }

    next();
  };
};

module.exports = { auth, authorize };
