import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../../store/slices/cartSlice";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const dispatch = useDispatch();
  const { isLogin } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const [selectedSize, setSelectedSize] = useState(null);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.topCartBtn}
          onPress={() => navigation.navigate("Cart")}
        >
          <Text style={styles.topCartIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.topCartBadge}>
              <Text style={styles.topCartBadgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      ),
    });
  }, [cartCount, navigation]);

  const SIZES = [38, 39, 40, 41, 42, 43, 44];

  const getPrice = () => {
    if (product.newPrice) return product.newPrice;
    if (typeof product.price === "string") {
      const n = parseInt(product.price.replace(/\D/g, ""), 10);
      return isNaN(n) ? 0 : n;
    }
    return product.price || 0;
  };

  const getImageSource = (image) => {
    if (!image) return null;
    if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"))) {
      return { uri: image };
    }
    if (typeof image === "number" || typeof image === "object") return image;
    return null;
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      Alert.alert("Chưa chọn size", "Vui lòng chọn size trước khi thêm vào giỏ hàng.");
      return;
    }
    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: getPrice(),
      image: typeof product.image === "string" ? product.image : "",
      size: selectedSize,
    };
    dispatch(addToCart(cartItem));
    Alert.alert("✅ Thêm thành công!", `"${product.name}" - Size ${selectedSize} đã vào giỏ hàng.`);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      Alert.alert("Chưa chọn size", "Vui lòng chọn size trước khi mua.");
      return;
    }
    if (!isLogin) {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để đặt hàng.", [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng nhập", onPress: () => navigation.navigate("Login") },
      ]);
      return;
    }
    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: getPrice(),
      image: typeof product.image === "string" ? product.image : "",
      size: selectedSize,
    };
    dispatch(addToCart(cartItem));
    navigation.navigate("Cart");
  };

  const price = getPrice();
  const imgSrc = getImageSource(product.image);
  const discount = product.discount || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f8fa" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image section */}
        <View style={styles.imageSection}>
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{discount}%</Text>
            </View>
          )}
          {imgSrc ? (
            <Image source={imgSrc} style={styles.productImage} />
          ) : (
            <View style={styles.imageFallback}>
              <Text style={styles.imageFallbackText}>👟</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailCard}>
          {/* Name & price */}
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.newPrice}>
              {price > 0 ? `${price.toLocaleString("vi-VN")}đ` : "Liên hệ"}
            </Text>
            {product.oldPrice && product.oldPrice !== price && (
              <Text style={styles.oldPrice}>
                {product.oldPrice.toLocaleString("vi-VN")}đ
              </Text>
            )}
          </View>

          {/* Hiển thị tồn kho */}
          <View style={styles.stockContainer}>
            {product.stock === 0 ? (
              <Text style={styles.outOfStockLabel}>⚠️ Trạng thái: Hết hàng</Text>
            ) : (
              <Text style={styles.inStockLabel}>✅ Số lượng còn: {product.stock !== undefined ? product.stock : 10} đôi</Text>
            )}
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          {product.description ? (
            <>
              <Text style={styles.sectionLabel}>📝 Mô tả sản phẩm</Text>
              <Text style={styles.description}>{product.description}</Text>
              <View style={styles.divider} />
            </>
          ) : null}

          {/* Size */}
          <View style={styles.sizeHeader}>
            <Text style={styles.sectionLabel}>📐 Chọn size</Text>
            {!selectedSize && (
              <Text style={styles.sizeRequired}>* Bắt buộc</Text>
            )}
            {selectedSize && (
              <Text style={styles.sizeSelected}>Đã chọn: {selectedSize}</Text>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sizesRow}>
            {SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeChip, selectedSize === size && styles.sizeChipActive]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextActive]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tags */}
          <View style={styles.tagsRow}>
            <View style={styles.tag}><Text style={styles.tagText}>🚚 Miễn phí vận chuyển</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>🔄 Đổi trả 7 ngày</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>✅ Hàng chính hãng</Text></View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={styles.bottomBar}>
        {product.stock === 0 ? (
          <View style={styles.outOfStockFullBtn}>
            <Text style={styles.outOfStockFullText}>SẢN PHẨM HIỆN ĐÃ HẾT HÀNG</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.cartBtn, !selectedSize && styles.cartBtnHidden]}
              onPress={handleAddToCart}
              disabled={!selectedSize}
            >
              <Text style={[styles.cartBtnText, !selectedSize && styles.cartBtnTextDisabled]}>
                🛒 Thêm giỏ
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
              <Text style={styles.buyBtnText}>⚡ Mua ngay</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f8fa" },

  // Image
  imageSection: {
    backgroundColor: "#f5f5f5",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  discountBadge: {
    position: "absolute", top: 64, right: 16, zIndex: 10,
    backgroundColor: "#e94560", paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8,
  },
  topCartBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#fff", justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 4, elevation: 5,
  },
  topCartIcon: { fontSize: 19 },
  topCartBadge: {
    position: "absolute", top: -4, right: -5,
    minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4,
    backgroundColor: "#e94560", justifyContent: "center", alignItems: "center",
  },
  topCartBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  discountText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  productImage: { width: width, height: 300, resizeMode: "contain" },
  imageFallback: {
    width: width, height: 300, justifyContent: "center", alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  imageFallbackText: { fontSize: 100 },

  // Detail card
  detailCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  productName: { fontSize: 22, fontWeight: "900", color: "#111", marginBottom: 10 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  newPrice: { fontSize: 26, fontWeight: "900", color: "#e94560" },
  oldPrice: {
    fontSize: 16, color: "#bbb", textDecorationLine: "line-through", fontWeight: "500",
  },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 14 },

  sectionLabel: { fontSize: 14, fontWeight: "800", color: "#333", marginBottom: 10 },
  sizeHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sizeRequired: { fontSize: 12, color: "#e94560", fontWeight: "700" },
  sizeSelected: { fontSize: 12, color: "#22c55e", fontWeight: "700" },
  description: { fontSize: 14, color: "#666", lineHeight: 22 },

  // Sizes
  sizesRow: { marginBottom: 16 },
  sizeChip: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: "#f5f5f5", justifyContent: "center", alignItems: "center",
    marginRight: 8, borderWidth: 1.5, borderColor: "#eee",
  },
  sizeChipActive: { backgroundColor: "#111", borderColor: "#111" },
  sizeText: { fontSize: 14, fontWeight: "700", color: "#555" },
  sizeTextActive: { color: "#fff" },

  // Tags
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: {
    backgroundColor: "#f0f0f0", paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: { fontSize: 12, color: "#555" },

  // Bottom bar
  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 14,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 10,
  },
  cartBtn: {
    flex: 1, height: 50, justifyContent: "center", alignItems: "center",
    borderRadius: 14, borderWidth: 2, borderColor: "#111",
  },
  cartBtnHidden: { backgroundColor: "#f3f4f6", borderColor: "#d1d5db" },
  cartBtnText: { fontSize: 15, fontWeight: "800", color: "#111" },
  cartBtnTextDisabled: { color: "#9ca3af" },
  buyBtn: {
    flex: 1.5, height: 50, justifyContent: "center", alignItems: "center",
    borderRadius: 14, backgroundColor: "#e94560",
  },
  buyBtnText: { fontSize: 15, fontWeight: "800", color: "#fff" },

  // Stock UI styles
  stockContainer: {
    marginBottom: 6,
  },
  outOfStockLabel: {
    color: "#ff3b30",
    fontWeight: "bold",
    fontSize: 13,
  },
  inStockLabel: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 13,
  },
  outOfStockFullBtn: {
    flex: 1,
    height: 50,
    backgroundColor: "#ccc",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockFullText: {
    color: "#777",
    fontWeight: "bold",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
