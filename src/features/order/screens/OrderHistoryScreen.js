import React, { useEffect } from "react";
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity, StatusBar,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyOrders } from "../../../store/slices/orderSlice";

const STATUS_CONFIG = {
  pending:    { label: "Chờ xử lý",     color: "#f59e0b", bg: "#fffbeb", icon: "⏳" },
  processing: { label: "Đã duyệt",       color: "#3b82f6", bg: "#eff6ff", icon: "✅" },
  shipped:    { label: "Đã giao hàng",   color: "#22c55e", bg: "#f0fdf4", icon: "✅" },
  cancelled:  { label: "Đã hủy",         color: "#ef4444", bg: "#fef2f2", icon: "❌" },
};

export default function OrderHistoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.order);
  const { isLogin } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLogin) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, isLogin]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} - ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  if (!isLogin) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.emptySub}>Đăng nhập để xem lịch sử đơn hàng của bạn.</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.shopBtnText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeLink} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.homeLinkText}>🏠 Về trang chủ</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !orders.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e94560" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerHomeBtn} onPress={() => navigation.navigate("Home")}>
          <Text style={styles.headerHomeIcon}>🏠</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>📦 Đơn hàng của tôi</Text>
          <Text style={styles.headerSub}>{orders.length} đơn hàng</Text>
        </View>
      </View>

      {error && orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Không thể tải đơn hàng</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => dispatch(fetchMyOrders())}>
            <Text style={styles.shopBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySub}>Hãy mua sắm và đặt hàng ngay!</Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.shopBtnText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          refreshing={loading}
          onRefresh={() => dispatch(fetchMyOrders())}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
            return (
              <View style={styles.card}>
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId} numberOfLines={1}>
                    #{item._id.slice(-8).toUpperCase()}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusText, { color: cfg.color }]}>
                      {cfg.icon} {cfg.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.orderDate}>🗓️ {formatDate(item.createdAt)}</Text>

                {/* Products list */}
                <View style={styles.productsList}>
                  {item.products.map((p, idx) => (
                    <View key={p._id || idx} style={styles.productRow}>
                      <Text style={styles.productDot}>👟</Text>
                      <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.productQty}>x{p.quantity || 1}</Text>
                      <Text style={styles.productPrice}>
                        {p.price.toLocaleString("vi-VN")}đ
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Total */}
                <View style={styles.cardFooter}>
                  <Text style={styles.totalLabel}>Tổng cộng</Text>
                  <Text style={styles.totalAmount}>
                    {item.totalAmount.toLocaleString("vi-VN")}đ
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f8fa" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: "#888", fontSize: 14 },

  header: {
    backgroundColor: "#111", paddingHorizontal: 16, flexDirection: "row",
    alignItems: "center", gap: 12,
    paddingTop: 48, paddingBottom: 16,
  },
  headerHomeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: "#292929", justifyContent: "center", alignItems: "center",
  },
  headerHomeIcon: { fontSize: 18 },
  headerTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  headerSub: { fontSize: 13, color: "#888", marginTop: 2 },

  emptyContainer: {
    flex: 1, justifyContent: "center", alignItems: "center", padding: 30,
  },
  emptyIcon: { fontSize: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "900", color: "#111", marginBottom: 8 },
  emptySub: { fontSize: 14, color: "#888", marginBottom: 24 },
  shopBtn: {
    backgroundColor: "#111", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 14,
  },
  shopBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  homeLink: { marginTop: 18, padding: 8 },
  homeLinkText: { color: "#555", fontSize: 14, fontWeight: "700" },

  list: { padding: 14, gap: 12 },

  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  cardHeader: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 6,
  },
  orderId: { fontSize: 14, fontWeight: "800", color: "#333", flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },

  orderDate: { fontSize: 12, color: "#aaa", marginBottom: 12 },

  productsList: {
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: "#f0f0f0",
    paddingVertical: 10, marginBottom: 10, gap: 6,
  },
  productRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  productDot: { fontSize: 14 },
  productName: { flex: 1, fontSize: 13, color: "#444", fontWeight: "600" },
  productQty: { fontSize: 12, color: "#888", marginRight: 4 },
  productPrice: { fontSize: 13, color: "#e94560", fontWeight: "700" },

  cardFooter: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  totalLabel: { fontSize: 14, color: "#888" },
  totalAmount: { fontSize: 18, fontWeight: "900", color: "#111" },
});
