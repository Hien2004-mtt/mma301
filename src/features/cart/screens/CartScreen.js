import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, clearCart, increaseQty, decreaseQty } from "../../../store/slices/cartSlice";

export default function CartScreen({ navigation }) {
  const cart = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  // Tổng tiền = giá × số lượng
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getImageSource = (image) => {
    if (!image) return null;
    if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"))) {
      return { uri: image };
    }
    return null;
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f7f8fa" />
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <Text style={styles.emptySubtitle}>Thêm sản phẩm vào giỏ để tiếp tục!</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.shopBtnText}>🏠 Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.homeBtnText}>🏠</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>🛒 Giỏ hàng</Text>
            <Text style={styles.headerSub}>{totalItems} sản phẩm</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => dispatch(clearCart())}>
          <Text style={styles.clearText}>Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={cart}
        keyExtractor={(item) => `${item.id}-${item.size}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const imgSrc = getImageSource(item.image);
          const itemTotal = item.price * item.quantity;
          return (
            <View style={styles.card}>
              {/* Ảnh sản phẩm */}
              <View style={styles.cardImageWrapper}>
                {imgSrc ? (
                  <Image source={imgSrc} style={styles.cardImage} />
                ) : (
                  <Text style={styles.cardImageFallback}>👟</Text>
                )}
              </View>

              {/* Thông tin */}
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>

                {/* Size badge */}
                <View style={styles.sizeBadge}>
                  <Text style={styles.sizeBadgeText}>Size {item.size}</Text>
                </View>

                {/* Giá đơn vị */}
                <Text style={styles.cardUnitPrice}>
                  {item.price.toLocaleString("vi-VN")}đ / đôi
                </Text>

                {/* Quantity controls */}
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => dispatch(decreaseQty({ id: item.id, size: item.size }))}
                  >
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => dispatch(increaseQty({ id: item.id, size: item.size }))}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>

                  {/* Tổng tiền dòng */}
                  <Text style={styles.cardLineTotal}>
                    = {itemTotal.toLocaleString("vi-VN")}đ
                  </Text>
                </View>
              </View>

              {/* Nút xóa */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => dispatch(removeFromCart({ id: item.id, size: item.size }))}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      {/* Footer tổng tiền */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Số lượng</Text>
          <Text style={styles.summaryValue}>{totalItems} đôi</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
          <Text style={[styles.summaryValue, { color: "#22c55e" }]}>Miễn phí 🎉</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalAmount}>{total.toLocaleString("vi-VN")}đ</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate("Checkout")}
        >
          <Text style={styles.checkoutBtnText}>Thanh toán →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f8fa" },

  emptyContainer: {
    flex: 1, justifyContent: "center", alignItems: "center",
    backgroundColor: "#f7f8fa", padding: 30,
  },
  emptyIcon: { fontSize: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: "900", color: "#111", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#888", marginBottom: 28 },
  shopBtn: {
    backgroundColor: "#111", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14,
  },
  shopBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },

  header: {
    backgroundColor: "#111", flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  homeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#292929", justifyContent: "center", alignItems: "center",
  },
  homeBtnText: { fontSize: 18 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 12, color: "#888", marginTop: 2 },
  clearText: { color: "#e94560", fontSize: 14, fontWeight: "700" },

  list: { padding: 14, gap: 10 },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff", borderRadius: 14, padding: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    alignItems: "flex-start",
  },
  cardImageWrapper: {
    width: 80, height: 80, borderRadius: 10, backgroundColor: "#f5f5f5",
    justifyContent: "center", alignItems: "center", overflow: "hidden",
    marginRight: 12, padding: 4,
  },
  cardImage: { width: "100%", height: "100%", resizeMode: "contain" },
  cardImageFallback: { fontSize: 36 },

  cardBody: { flex: 1 },
  cardName: { fontSize: 13, fontWeight: "700", color: "#111", lineHeight: 18, marginBottom: 6 },

  sizeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#111", paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 6, marginBottom: 5,
  },
  sizeBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  cardUnitPrice: { fontSize: 12, color: "#888", marginBottom: 8 },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: "#ddd",
  },
  qtyBtnText: { fontSize: 16, fontWeight: "700", color: "#333", lineHeight: 20 },
  qtyNum: { fontSize: 15, fontWeight: "800", color: "#111", minWidth: 20, textAlign: "center" },
  cardLineTotal: { fontSize: 14, fontWeight: "900", color: "#e94560", marginLeft: "auto" },

  removeBtn: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "#f5f5f5", justifyContent: "center", alignItems: "center",
    marginLeft: 8, marginTop: 2,
  },
  removeBtnText: { color: "#999", fontSize: 12, fontWeight: "bold" },

  footer: {
    backgroundColor: "#fff", padding: 16, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: "#eee",
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: "#888" },
  summaryValue: { fontSize: 14, color: "#333", fontWeight: "600" },
  totalRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderTopWidth: 1, borderTopColor: "#eee",
    paddingTop: 12, marginTop: 4, marginBottom: 14,
  },
  totalLabel: { fontSize: 16, fontWeight: "900", color: "#111" },
  totalAmount: { fontSize: 22, fontWeight: "900", color: "#e94560" },
  checkoutBtn: {
    backgroundColor: "#111", borderRadius: 14, height: 52,
    justifyContent: "center", alignItems: "center",
  },
  checkoutBtnText: { color: "#fff", fontSize: 17, fontWeight: "900" },
});
