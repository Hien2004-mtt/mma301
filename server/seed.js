require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mma301";

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Đã kết nối MongoDB để nạp dữ liệu...");

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log("Đã dọn dẹp các bảng User và Product.");

    // Tạo mật khẩu mã hóa mẫu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // Tạo người dùng mẫu
    const users = [
      {
        name: "Quản trị viên",
        email: "admin@gmail.com",
        password: hashedPassword,
        phone: "0999999999",
        address: "Hà Nội, Việt Nam",
        role: "admin",
      },
      {
        name: "Khách hàng mẫu",
        email: "customer@gmail.com",
        password: hashedPassword,
        phone: "0123456789",
        address: "TP. Hồ Chí Minh, Việt Nam",
        role: "customer",
      },
    ];

    await User.insertMany(users);
    console.log("Đã tạo tài khoản mẫu:");
    console.log("  - Admin: admin@gmail.com / 123456");
    console.log("  - Customer: customer@gmail.com / 123456");

    // Tạo sản phẩm mẫu
    // Sử dụng URL ảnh placeholder hoặc một số ảnh có sẵn để tránh lỗi hiển thị ảnh
    const products = [
      {
        name: "Nike Air Force 1",
        oldPrice: 3000000,
        newPrice: 2500000,
        discount: 16,
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=60",
        description: "Giày thời trang Nike Air Force 1 chính hãng thiết kế cổ điển phong cách.",
      },
      {
        name: "Adidas Ultraboost",
        oldPrice: 4000000,
        newPrice: 3200000,
        discount: 20,
        image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&auto=format&fit=crop&q=60",
        description: "Giày chạy bộ Adidas Ultraboost êm ái, trợ lực tốt và thoáng khí.",
      },
      {
        name: "Nike Jordan High",
        oldPrice: 5000000,
        newPrice: 4000000,
        discount: 20,
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&auto=format&fit=crop&q=60",
        description: "Giày bóng rổ cổ cao Air Jordan phong cách hiphop cực chất.",
      },
      {
        name: "Puma Smash V2",
        oldPrice: 1500000,
        newPrice: 1200000,
        discount: 20,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&auto=format&fit=crop&q=60",
        description: "Giày thể thao Puma năng động trẻ trung và cực nhẹ chân.",
      },
    ];

    await Product.insertMany(products);
    console.log("Đã nạp thành công 4 sản phẩm mẫu.");

    mongoose.connection.close();
    console.log("Hoàn thành nạp dữ liệu mẫu và ngắt kết nối.");
  } catch (error) {
    console.error("Lỗi khi nạp dữ liệu mẫu:", error);
    process.exit(1);
  }
};

seedData();
