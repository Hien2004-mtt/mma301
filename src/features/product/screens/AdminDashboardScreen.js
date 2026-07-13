import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  StatusBar,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  addProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "../../../store/slices/productSlice";
import { fetchAllOrders, updateOrderStatus } from "../../../store/slices/orderSlice";
import { logout } from "../../../store/slices/authSlice";
import { logoutUser } from "../../auth/authService";

export default function AdminDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("products"); // 'products' hoặc 'orders'

  // Form thêm sản phẩm
  const [name, setName] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State modal chỉnh sửa sản phẩm
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editOldPrice, setEditOldPrice] = useState("");
  const [editNewPrice, setEditNewPrice] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Redux state
  const { products, loading: productsLoading } = useSelector((state) => state.product);
  const { orders, loading: ordersLoading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          dispatch(logout());
          navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        },
      },
    ]);
  };

  useEffect(() => {
    if (activeTab === "products") {
      dispatch(fetchProducts());
    } else {
      dispatch(fetchAllOrders());
    }
  }, [activeTab, dispatch]);

  const handleAddProduct = async () => {
    if (!name || !oldPrice || !newPrice) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên và giá sản phẩm.");
      return;
    }

    const oPrice = parseFloat(oldPrice);
    const nPrice = parseFloat(newPrice);
    const disc = Math.round(((oPrice - nPrice) / oPrice) * 100);

    setSubmitting(true);
    try {
      await dispatch(
        addProduct({
          name,
          oldPrice: oPrice,
          newPrice: nPrice,
          discount: disc > 0 ? disc : 0,
          image: image || "https://via.placeholder.com/150",
          description,
        })
      ).unwrap();

      Alert.alert("Thành công", "Đã thêm sản phẩm mới!");
      // Reset form
      setName("");
      setOldPrice("");
      setNewPrice("");
      setImage("");
      setDescription("");
    } catch (error) {
      Alert.alert("Lỗi", error || "Không thể thêm sản phẩm.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mở modal chỉnh sửa sản phẩm
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditName(product.name || "");
    setEditOldPrice(product.oldPrice?.toString() || "");
    setEditNewPrice(product.newPrice?.toString() || "");
    setEditImage(product.image || "");
    setEditDescription(product.description || "");
    setEditModalVisible(true);
  };

  // Lưu chỉnh sửa sản phẩm
  const handleSaveEdit = async () => {
    if (!editName || !editOldPrice || !editNewPrice) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên và giá sản phẩm.");
      return;
    }

    const oPrice = parseFloat(editOldPrice);
    const nPrice = parseFloat(editNewPrice);
    const disc = Math.round(((oPrice - nPrice) / oPrice) * 100);

    setEditSubmitting(true);
    try {
      await dispatch(
        updateProduct({
          id: editingProduct._id || editingProduct.id,
          productData: {
            name: editName,
            oldPrice: oPrice,
            newPrice: nPrice,
            discount: disc > 0 ? disc : 0,
            image: editImage || "https://via.placeholder.com/150",
            description: editDescription,
          },
        })
      ).unwrap();

      Alert.alert("Thành công", "Đã cập nhật sản phẩm!");
      setEditModalVisible(false);
      setEditingProduct(null);
    } catch (error) {
      Alert.alert("Lỗi", error || "Không thể cập nhật sản phẩm.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteProduct = (id) => {
    Alert.alert("Xác nhận xóa", "Bạn có chắc muốn xóa sản phẩm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(deleteProduct(id)).unwrap();
            Alert.alert("Thành công", "Đã xóa sản phẩm.");
          } catch (error) {
            Alert.alert("Lỗi", error || "Không thể xóa sản phẩm.");
          }
        },
      },
    ]);
  };

  const handleStatusChange = (orderId, currentStatus) => {
    const statuses = ["pending", "processing", "shipped", "cancelled"];
    const statusLabels = {
      pending: "Chờ xử lý",
      processing: "Đã duyệt",
      shipped: "Đã giao hàng",
      cancelled: "Hủy đơn hàng",
    };

    Alert.alert(
      "Cập nhật trạng thái đơn",
      "Chọn trạng thái mới:",
      statuses
        .filter((s) => s !== currentStatus)
        .map((s) => ({
          text: statusLabels[s],
          onPress: async () => {
            try {
              await dispatch(updateOrderStatus({ id: orderId, status: s })).unwrap();
              Alert.alert("Thành công", "Đã cập nhật trạng thái.");
              dispatch(fetchAllOrders());
            } catch (error) {
              Alert.alert("Lỗi", error || "Không thể cập nhật.");
            }
          },
        })).concat([{ text: "Hủy", style: "cancel" }])
    );
  };

  const approveOrder = async (orderId) => {
    setUpdatingOrderId(orderId);
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: "processing" })).unwrap();
      Alert.alert("Thành công", "Đơn hàng đã được duyệt.");
    } catch (error) {
      Alert.alert("Lỗi", error || "Không thể duyệt đơn hàng.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleApproveOrder = (orderId) => {
    const message = "Bạn có chắc muốn duyệt đơn hàng này?";

    if (Platform.OS === "web") {
      if (globalThis.confirm(message)) {
        approveOrder(orderId);
      }
      return;
    }

    Alert.alert("Duyệt đơn hàng", message, [
      { text: "Hủy", style: "cancel" },
      { text: "Duyệt đơn", onPress: () => approveOrder(orderId) },
    ]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#ff9900";
      case "processing": return "#0066cc";
      case "shipped": return "#009900";
      case "cancelled": return "#cc0000";
      default: return "#ff9900";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending": return "Chờ xử lý";
      case "processing": return "Đã duyệt";
      case "shipped": return "Đã giao hàng";
      case "cancelled": return "Đã hủy";
      default: return "Chờ xử lý";
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />

      {/* Dark Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.topHeaderTitle}>⚙️ Admin Panel</Text>
          <Text style={styles.topHeaderSub}>Xin chào, {user?.name || "Admin"} 👋</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.headerBtnText}>🏠 Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, styles.logoutBtn]}
            onPress={handleLogout}
          >
            <Text style={styles.headerBtnText}>🚪 Thoát</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "products" && styles.activeTab]}
          onPress={() => setActiveTab("products")}
        >
          <Text style={[styles.tabText, activeTab === "products" && styles.activeTabText]}>
            🛍️ Sản phẩm ({products.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "orders" && styles.activeTab]}
          onPress={() => setActiveTab("orders")}
        >
          <Text style={[styles.tabText, activeTab === "orders" && styles.activeTabText]}>
            📦 Đơn hàng ({orders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ===== Tab Sản phẩm ===== */}
      {activeTab === "products" && (
        <ScrollView style={styles.content}>
          <Text style={styles.subSectionTitle}>➕ Thêm sản phẩm mới</Text>
          <TextInput
            placeholder="Tên sản phẩm *"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <View style={styles.row}>
            <TextInput
              placeholder="Giá gốc (VNĐ) *"
              style={[styles.input, styles.halfInput]}
              value={oldPrice}
              onChangeText={setOldPrice}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Giá bán (VNĐ) *"
              style={[styles.input, styles.halfInput]}
              value={newPrice}
              onChangeText={setNewPrice}
              keyboardType="numeric"
            />
          </View>
          <TextInput
            placeholder="Đường dẫn ảnh sản phẩm (URL)"
            style={styles.input}
            value={image}
            onChangeText={setImage}
          />
          <TextInput
            placeholder="Mô tả sản phẩm"
            style={[styles.input, { height: 80 }]}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddProduct}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>💾 Lưu sản phẩm</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.subSectionTitle}>
            📋 Danh sách sản phẩm ({products.length})
          </Text>
          {productsLoading && !products.length ? (
            <ActivityIndicator size="small" color="#0066cc" />
          ) : (
            products.map((item) => (
              <View key={item._id || item.id} style={styles.itemCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>
                    {item.newPrice?.toLocaleString("vi-VN")}đ
                    {" "}
                    <Text style={styles.itemOldPrice}>
                      (Gốc: {item.oldPrice?.toLocaleString("vi-VN")}đ)
                    </Text>
                  </Text>
                  {item.discount > 0 && (
                    <Text style={styles.discountLabel}>-{item.discount}% OFF</Text>
                  )}
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleOpenEdit(item)}
                  >
                    <Text style={styles.editButtonText}>✏️ Sửa</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteProduct(item._id || item.id)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️ Xóa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* ===== Tab Đơn hàng ===== */}
      {activeTab === "orders" && (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          refreshing={ordersLoading}
          onRefresh={() => dispatch(fetchAllOrders())}
          ListEmptyComponent={
            <View style={styles.emptyOrders}>
              <Text style={styles.emptyOrdersText}>Chưa có đơn hàng nào.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderUser}>
                  👤 {item.userId?.name || "Khách vãng lai"}
                </Text>
                <TouchableOpacity
                  style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
                  onPress={() => handleStatusChange(item._id, item.status)}
                >
                  <Text style={styles.statusBadgeText}>
                    {getStatusLabel(item.status)}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.orderInfo}>📧 {item.userId?.email || "Không có"}</Text>
              <Text style={styles.orderInfo}>📞 {item.userId?.phone || "Không có"}</Text>
              <Text style={styles.orderInfo}>📍 {item.userId?.address || "Không có"}</Text>
              <Text style={styles.orderInfo}>🗓️ Ngày đặt: {formatDate(item.createdAt)}</Text>

              <View style={styles.orderProducts}>
                {item.products.map((p, idx) => (
                  <Text key={idx} style={styles.orderProductItem}>
                    • {p.name} x{p.quantity || 1} — {p.price?.toLocaleString("vi-VN")}đ
                  </Text>
                ))}
              </View>

              <Text style={styles.orderTotal}>
                Tổng: {item.totalAmount.toLocaleString("vi-VN")} VNĐ
              </Text>

              {item.status === "pending" ? (
                <TouchableOpacity
                  style={[
                    styles.approveOrderBtn,
                    updatingOrderId === item._id && styles.orderActionBtnDisabled,
                  ]}
                  onPress={() => handleApproveOrder(item._id)}
                  disabled={updatingOrderId === item._id}
                >
                  {updatingOrderId === item._id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.approveOrderBtnText}>✅ Duyệt đơn</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.updateStatusBtn}
                  onPress={() => handleStatusChange(item._id, item.status)}
                >
                  <Text style={styles.updateStatusBtnText}>🔄 Cập nhật trạng thái</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          style={styles.content}
        />
      )}

      {/* ===== Modal Chỉnh sửa sản phẩm ===== */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>✏️ Chỉnh sửa sản phẩm</Text>

            <ScrollView>
              <TextInput
                placeholder="Tên sản phẩm *"
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
              />
              <View style={styles.row}>
                <TextInput
                  placeholder="Giá gốc (VNĐ) *"
                  style={[styles.input, styles.halfInput]}
                  value={editOldPrice}
                  onChangeText={setEditOldPrice}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Giá bán (VNĐ) *"
                  style={[styles.input, styles.halfInput]}
                  value={editNewPrice}
                  onChangeText={setEditNewPrice}
                  keyboardType="numeric"
                />
              </View>
              <TextInput
                placeholder="Đường dẫn ảnh (URL)"
                style={styles.input}
                value={editImage}
                onChangeText={setEditImage}
              />
              <TextInput
                placeholder="Mô tả sản phẩm"
                style={[styles.input, { height: 80 }]}
                multiline
                numberOfLines={3}
                value={editDescription}
                onChangeText={setEditDescription}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModalVisible(false)}
                disabled={editSubmitting}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveEdit}
                disabled={editSubmitting}
              >
                {editSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalSaveText}>💾 Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f8fa" },
  topHeader: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  topHeaderTitle: { fontSize: 22, fontWeight: "900", color: "#fff" },
  topHeaderSub: { fontSize: 13, color: "#888", marginTop: 2 },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn: {
    backgroundColor: "#222",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  logoutBtn: { backgroundColor: "#7f1d1d" },
  headerBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  tabContainer: {
    flexDirection: "row",
    margin: 14,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  activeTab: { backgroundColor: "#111" },
  tabText: { fontSize: 13, color: "#555", fontWeight: "700" },
  activeTabText: { color: "#fff" },
  content: { flex: 1, paddingTop: 4 },
  subSectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#333",
    marginTop: 10,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 15,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  halfInput: { width: "48%" },
  addButton: {
    backgroundColor: "#0088cc",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Item card
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  itemName: { fontSize: 15, fontWeight: "bold", color: "#333" },
  itemPrice: { fontSize: 14, color: "#009900", marginTop: 2, fontWeight: "bold" },
  itemOldPrice: { fontSize: 12, color: "#999", fontWeight: "normal" },
  discountLabel: {
    fontSize: 12,
    color: "#fff",
    backgroundColor: "red",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
    fontWeight: "bold",
  },
  actionButtons: { flexDirection: "column", gap: 6 },
  editButton: {
    backgroundColor: "#ff8800",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  editButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  deleteButton: {
    backgroundColor: "#cc0000",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: { color: "#fff", fontWeight: "bold", fontSize: 13 },

  // Order card
  emptyOrders: { alignItems: "center", marginTop: 50 },
  emptyOrdersText: { color: "#999", fontSize: 16 },
  orderCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#e8e8e8",
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderUser: { fontSize: 15, fontWeight: "bold", color: "#333", flex: 1 },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusBadgeText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  orderInfo: { fontSize: 13, color: "#666", marginBottom: 2 },
  orderProducts: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
    paddingVertical: 8,
    marginVertical: 8,
  },
  orderProductItem: { fontSize: 13, color: "#444", marginBottom: 2 },
  orderTotal: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#cc0000",
    textAlign: "right",
    marginBottom: 8,
  },
  updateStatusBtn: {
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#0066cc",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  updateStatusBtnText: { color: "#0066cc", fontWeight: "bold", fontSize: 14 },
  approveOrderBtn: {
    backgroundColor: "#16a34a",
    padding: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  approveOrderBtnText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  orderActionBtnDisabled: { opacity: 0.6 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 15,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancelText: { color: "#555", fontWeight: "bold", fontSize: 16 },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: "#0066cc",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  modalSaveText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
