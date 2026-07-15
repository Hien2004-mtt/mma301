import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { placeOrder } from "../../../store/slices/orderSlice";
import { clearCart } from "../../../store/slices/cartSlice";

export default function CheckoutScreen({ navigation }) {
  const cart = useSelector((state) => state.cart.items);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const confirmOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Lỗi", "Giỏ hàng của bạn đang trống.");
      return;
    }
    const formattedProducts = cart.map((item) => ({
      productId: item.id,
      name: `${item.name} (Size ${item.size})`,
      price: item.price,
      quantity: item.quantity,
    }));
    setLoading(true);
    try {
      await dispatch(placeOrder({ products: formattedProducts, totalAmount: total })).unwrap();
      dispatch(clearCart());
      Alert.alert("🎉 Đặt hàng thành công!", "Đơn hàng đã được tạo. Chúng tôi sẽ liên hệ sớm!");
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      Alert.alert("Lỗi đặt hàng", error || "Không thể đặt hàng, thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({ label, value, highlight }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
        <Text style={styles.headerSub}>{cart.length} sản phẩm</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Shipping info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Thông tin giao hàng</Text>
          <InfoRow label="Họ tên" value={user?.name || "Chưa cập nhật"} />
          <InfoRow label="Email" value={user?.email || "Chưa cập nhật"} />
          <InfoRow label="SĐT" value={user?.phone || "Chưa cập nhật"} />
          <InfoRow label="Địa chỉ" value={user?.address || "Chưa cập nhật"} />
          {(!user?.phone || !user?.address) && (
            <TouchableOpacity
              style={styles.updateBtn}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={styles.updateBtnText}>✏️ Cập nhật thông tin giao hàng</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍️ Sản phẩm đặt mua</Text>
          {cart.map((item, index) => (
            <View key={index} style={styles.productRow}>
              <View style={styles.productIcon}>
                <Text style={{ fontSize: 20 }}>👟</Text>
              </View>
              <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price.toLocaleString("vi-VN")}đ</Text>
            </View>
          ))}
        </View>

        {/* Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Tóm tắt thanh toán</Text>
          <InfoRow label="Tạm tính" value={`${total.toLocaleString("vi-VN")}đ`} />
          <InfoRow label="Phí vận chuyển" value="Miễn phí 🎉" />
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalAmount}>{total.toLocaleString("vi-VN")}đ</Text>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentIcon}>💵</Text>
            <View>
              <Text style={styles.paymentName}>Thanh toán khi nhận hàng</Text>
              <Text style={styles.paymentSub}>COD — An toàn & Tiện lợi</Text>
            </View>
            <View style={styles.paymentCheck}>
              <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomTotal}>{total.toLocaleString("vi-VN")}đ</Text>
          <Text style={styles.bottomSub}>Bao gồm phí vận chuyển</Text>
        </View>
        <TouchableOpacity
          style={[styles.orderBtn, loading && styles.orderBtnDisabled]}
          onPress={confirmOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.orderBtnText}>Đặt hàng →</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f8fa" },

  header: {
    backgroundColor: "#111", paddingHorizontal: 16,
    paddingTop: 48, paddingBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 13, color: "#888", marginTop: 2 },

  section: {
    backgroundColor: "#fff", marginHorizontal: 14, marginTop: 14,
    borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#111", marginBottom: 12 },

  infoRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 8,
  },
  infoLabel: { fontSize: 13, color: "#888", flex: 0.4 },
  infoValue: { fontSize: 13, color: "#333", fontWeight: "600", flex: 0.6, textAlign: "right" },
  infoValueHighlight: { color: "#22c55e" },

  updateBtn: {
    marginTop: 8, backgroundColor: "#fff8e1",
    borderWidth: 1, borderColor: "#ffc107",
    padding: 10, borderRadius: 10, alignItems: "center",
  },
  updateBtnText: { color: "#e65100", fontSize: 13, fontWeight: "700" },

  productRow: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
  },
  productIcon: {
    width: 38, height: 38, borderRadius: 8, backgroundColor: "#f5f5f5",
    justifyContent: "center", alignItems: "center", marginRight: 10,
  },
  productName: { flex: 1, fontSize: 13, color: "#333", fontWeight: "600", marginRight: 8 },
  productPrice: { fontSize: 14, color: "#e94560", fontWeight: "800" },

  divider: { height: 1, backgroundColor: "#f0f0f0", marginVertical: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 15, fontWeight: "800", color: "#111" },
  totalAmount: { fontSize: 20, fontWeight: "900", color: "#e94560" },

  paymentCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f7fffe", borderWidth: 1.5, borderColor: "#22c55e",
    borderRadius: 12, padding: 14, gap: 12,
  },
  paymentIcon: { fontSize: 28 },
  paymentName: { fontSize: 14, fontWeight: "700", color: "#111" },
  paymentSub: { fontSize: 12, color: "#888", marginTop: 2 },
  paymentCheck: {
    marginLeft: "auto", width: 22, height: 22, borderRadius: 11,
    backgroundColor: "#22c55e", justifyContent: "center", alignItems: "center",
  },

  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "#fff", flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: "#eee",
    shadowColor: "#000", shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 10,
  },
  bottomTotal: { fontSize: 20, fontWeight: "900", color: "#e94560" },
  bottomSub: { fontSize: 11, color: "#aaa", marginTop: 2 },
  orderBtn: {
    backgroundColor: "#111", paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: 14, minWidth: 140, alignItems: "center",
  },
  orderBtnDisabled: { backgroundColor: "#999" },
  orderBtnText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
