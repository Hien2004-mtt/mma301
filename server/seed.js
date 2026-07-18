require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Kết nối Atlas
const MONGO_URI = process.env.MONGODB_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ Error:", err));

// Định nghĩa schema đơn giản
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: String,
  password: String, // bcrypt hash
  phone: String,
  address: String,
  role: String,
}, { timestamps: true }));

const Product = mongoose.model("Product", new mongoose.Schema({
  name: String,
  oldPrice: Number,
  newPrice: Number,
  discount: Number,
  image: String,
  description: String,
  stock: Number,
}, { timestamps: true }));

const Order = mongoose.model("Order", new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  products: Array,
  totalAmount: Number,
  status: String,
}, { timestamps: true }));

const Message = mongoose.model("Message", new mongoose.Schema({
  sender: mongoose.Schema.Types.ObjectId,
  senderName: String,
  senderRole: String,
  content: String,
}, { timestamps: true }));

// Insert demo data
async function seed() {
  try {
    // Admin mặc định với mật khẩu Hien12345!
    const hashedAdminPassword = await bcrypt.hash("Hien12345!", 10);
    const admin = await User.create({
      name: "Quản trị viên",
      email: "admin@gmail.com",
      password: hashedAdminPassword,
      phone: "0999999999",
      address: "Hà Nội, Việt Nam",
      role: "admin",
    });

    // Customer demo
    const customer = await User.create({
      name: "Khách hàng mẫu",
      email: "customer@gmail.com",
      password: await bcrypt.hash("123456", 10),
      phone: "0123456789",
      address: "TP. Hồ Chí Minh, Việt Nam",
      role: "customer",
    });

    // Admin1 demo
    const admin1 = await User.create({
      name: "Admin 1",
      email: "admin1@gmail.com",
      password: await bcrypt.hash("Hien12345!", 10),
      phone: "0888888888",
      address: "Đà Nẵng, Việt Nam",
      role: "admin",
    });

    // Products demo
    const nike = await Product.create({
      name: "Nike Air Force 1",
      oldPrice: 3000000,
      newPrice: 2500000,
      discount: 17,
      image: "https://images.unsplash.com/photo-15959550653106-6c9ebd614d3a?w=500",
      description: "Giày thời trang Nike Air Force 1 chính hãng thiết kế cổ điển.",
      stock: 10,
    });

    const adidas = await Product.create({
      name: "Adidas Ultraboost",
      oldPrice: 4000000,
      newPrice: 3200000,
      discount: 20,
      image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500",
      description: "Giày chạy bộ Adidas Ultraboost êm ái, trợ lực tốt và thoáng khí.",
      stock: 0,
    });

    // Orders demo
    await Order.create({
      userId: customer._id,
      products: [{ productId: adidas._id, quantity: 1 }],
      totalAmount: 3200000,
      status: "shipped",
    });

    // Messages demo
    await Message.create({
      sender: customer._id,
      senderName: "hiền",
      senderRole: "customer",
      content: "Hello 😄",
    });

    console.log("✅ Seed dữ liệu demo thành công!");
    process.exit();
  } catch (err) {
    console.error("❌ Lỗi seed dữ liệu:", err);
    process.exit(1);
  }
}

seed();
