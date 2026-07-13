import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { login, logout } from "../../../store/slices/authSlice";
import { logoutUser } from "../../auth/authService";
import axiosInstance from "../../../services/api/axios";

export default function ProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, isLogin } = useSelector((state) => state.auth);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [loading, setLoading] = useState(false);

  const performLogout = async () => {
    await logoutUser();
    dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: "Home" }] });
  };

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (globalThis.confirm("Bạn có chắc muốn đăng xuất?")) {
        performLogout();
      }
      return;
    }

    Alert.alert("Xác nhận", "Bạn có chắc muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: performLogout,
      },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Tên không được để trống.");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/auth/profile`, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      // Cập nhật Redux store với thông tin mới
      dispatch(login({ ...user, name: name.trim(), phone: phone.trim(), address: address.trim() }));
      Alert.alert("Thành công", "Đã cập nhật thông tin tài khoản!");
      setEditing(false);
    } catch (error) {
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể cập nhật. Thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setPhone(user?.phone || "");
    setAddress(user?.address || "");
    setEditing(false);
  };

  if (!isLogin) {
    return (
      <View style={styles.notLoginContainer}>
        <Text style={styles.notLoginIcon}>👤</Text>
        <Text style={styles.notLoginText}>Bạn chưa đăng nhập</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Avatar & tên */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || "Người dùng"}</Text>
        {user?.role === "admin" && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>⚙️ Admin</Text>
          </View>
        )}
      </View>

      {/* Thông tin tài khoản */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin tài khoản</Text>

        {/* Email - không cho sửa */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Email</Text>
          <Text style={styles.infoValue}>{user?.email || "Chưa có"}</Text>
        </View>

        <View style={styles.divider} />

        {/* Tên */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👤 Họ tên</Text>
          {editing ? (
            <TextInput
              style={styles.editInput}
              value={name}
              onChangeText={setName}
              placeholder="Nhập họ tên"
            />
          ) : (
            <Text style={styles.infoValue}>{user?.name || "Chưa có"}</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Số điện thoại */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📞 Số điện thoại</Text>
          {editing ? (
            <TextInput
              style={styles.editInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.infoValue}>{user?.phone || "Chưa có"}</Text>
          )}
        </View>

        <View style={styles.divider} />

        {/* Địa chỉ */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📍 Địa chỉ</Text>
          {editing ? (
            <TextInput
              style={[styles.editInput, { flex: 1 }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Nhập địa chỉ"
              multiline
            />
          ) : (
            <Text style={styles.infoValue}>{user?.address || "Chưa có"}</Text>
          )}
        </View>
      </View>

      {/* Nút hành động */}
      {editing ? (
        <View style={styles.editActions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancelEdit}
            disabled={loading}
          >
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setEditing(true)}
        >
          <Text style={styles.editBtnText}>✏️ Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
      )}

      {/* Phím tắt */}
      <View style={styles.card} style={{ marginTop: 15 }}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("OrderHistory")}
        >
          <Text style={styles.menuItemText}>📦 Lịch sử đơn hàng</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        {user?.role === "admin" && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("AdminDashboard")}
          >
            <Text style={styles.menuItemText}>⚙️ Quản trị Admin</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Điều hướng về trang chủ */}
      <TouchableOpacity
        style={styles.homeActionBtn}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.homeActionBtnText}>🏠 Về trang chủ</Text>
      </TouchableOpacity>

      {/* Nút đăng xuất */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>🚪 Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  notLoginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#fff",
  },
  notLoginIcon: { fontSize: 60, marginBottom: 15 },
  notLoginText: { fontSize: 18, color: "#666", marginBottom: 25 },
  loginBtn: {
    backgroundColor: "#0066cc",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  loginBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Header avatar
  header: {
    backgroundColor: "#111",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0066cc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarText: { fontSize: 32, color: "#fff", fontWeight: "bold" },
  userName: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 6 },
  adminBadge: {
    backgroundColor: "#cc0000",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 4,
  },
  adminBadgeText: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  // Card thông tin
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#999",
    textTransform: "uppercase",
    paddingTop: 12,
    paddingBottom: 8,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
  },
  infoLabel: { fontSize: 15, color: "#555", flex: 0.45 },
  infoValue: { fontSize: 15, color: "#111", fontWeight: "500", flex: 0.55, textAlign: "right" },
  editInput: {
    fontSize: 15,
    color: "#111",
    borderBottomWidth: 1.5,
    borderBottomColor: "#0066cc",
    flex: 0.55,
    textAlign: "right",
    paddingVertical: 2,
  },
  divider: { height: 1, backgroundColor: "#f0f0f0" },

  // Nút edit
  editBtn: {
    marginHorizontal: 15,
    marginTop: 15,
    backgroundColor: "#0066cc",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  editBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  editActions: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginTop: 15,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelBtnText: { color: "#555", fontSize: 16, fontWeight: "bold" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#009900",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Menu items
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: { fontSize: 16, color: "#333" },
  menuArrow: { fontSize: 22, color: "#bbb" },

  // Home & logout
  homeActionBtn: {
    marginHorizontal: 15,
    marginTop: 20,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  homeActionBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  logoutBtn: {
    marginHorizontal: 15,
    marginTop: 12,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#cc0000",
  },
  logoutBtnText: { color: "#cc0000", fontSize: 16, fontWeight: "bold" },
});
