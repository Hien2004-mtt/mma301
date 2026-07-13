const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, authorize } = require("../middleware/auth");

// Lấy toàn bộ danh sách sản phẩm (Công khai)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi tải sản phẩm." });
  }
});

// Lấy thông tin chi tiết một sản phẩm (Công khai)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
});

// Thêm mới sản phẩm (Chỉ Admin)
router.post("/", auth, authorize(["admin"]), async (req, res) => {
  try {
    const { name, oldPrice, newPrice, discount, image, description } = req.body;

    const product = new Product({
      name,
      oldPrice,
      newPrice,
      discount: discount || 0,
      image: image || "",
      description: description || "",
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo sản phẩm." });
  }
});

// Cập nhật sản phẩm (Chỉ Admin)
router.put("/:id", auth, authorize(["admin"]), async (req, res) => {
  try {
    const { name, oldPrice, newPrice, discount, image, description } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }

    product.name = name || product.name;
    product.oldPrice = oldPrice !== undefined ? oldPrice : product.oldPrice;
    product.newPrice = newPrice !== undefined ? newPrice : product.newPrice;
    product.discount = discount !== undefined ? discount : product.discount;
    product.image = image !== undefined ? image : product.image;
    product.description = description !== undefined ? description : product.description;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi cập nhật sản phẩm." });
  }
});

// Xóa sản phẩm (Chỉ Admin)
router.delete("/:id", auth, authorize(["admin"]), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
    }
    res.json({ message: "Xóa sản phẩm thành công." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống khi xóa sản phẩm." });
  }
});

module.exports = router;
