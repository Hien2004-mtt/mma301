import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../../../store/slices/authSlice";
import { loginUser } from "../authService";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ email và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(email, password);
      dispatch(login(data.user));

      // ✅ Redirect theo role
      if (data.user.role === "admin") {
        navigation.reset({ index: 0, routes: [{ name: "AdminDashboard" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
    } catch (error) {
      Alert.alert("Đăng nhập thất bại", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />

      {/* Background gradient layers */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>👟</Text>
            </View>
            <Text style={styles.brandName}>SneakerHub</Text>
            <Text style={styles.brandTagline}>Giày xịn — Giá tốt — Giao nhanh</Text>
          </View>

          {/* Card form */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Chào mừng trở lại!</Text>
            <Text style={styles.cardSubtitle}>Đăng nhập để tiếp tục mua sắm</Text>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>📧 Email</Text>
              <View style={[styles.inputWrapper, focusedField === "email" && styles.inputFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="admin@gmail.com"
                  placeholderTextColor="#bbb"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>🔒 Mật khẩu</Text>
              <View style={[styles.inputWrapper, focusedField === "password" && styles.inputFocused]}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#bbb"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Đăng nhập →</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.registerBtnText}>Tạo tài khoản mới</Text>
            </TouchableOpacity>
          </View>

          {/* Quick hint */}
          <View style={styles.hint}>
            <Text style={styles.hintText}>💡 Tài khoản demo: admin@gmail.com / 123456</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  flex: { flex: 1 },

  // Background layers
  bgTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "#111",
  },
  bgBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "#f7f8fa",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Brand
  brandSection: { alignItems: "center", marginBottom: 30 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#222",
    borderWidth: 2,
    borderColor: "#e94560",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 38 },
  brandName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  brandTagline: { fontSize: 13, color: "#888", marginTop: 4 },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: "900", color: "#111", marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: "#888", marginBottom: 24 },

  // Fields
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#555", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#eee",
    paddingHorizontal: 14,
    height: 50,
  },
  inputFocused: { borderColor: "#111", backgroundColor: "#fff" },
  input: { flex: 1, fontSize: 15, color: "#111" },
  eyeBtn: { paddingLeft: 10 },
  eyeText: { fontSize: 18 },

  // Login button
  loginBtn: {
    backgroundColor: "#111",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#111",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnDisabled: { backgroundColor: "#888" },
  loginBtnText: { color: "#fff", fontSize: 17, fontWeight: "800", letterSpacing: 0.5 },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#eee" },
  dividerText: { marginHorizontal: 12, color: "#bbb", fontSize: 13 },

  // Register
  registerBtn: {
    borderWidth: 1.5,
    borderColor: "#111",
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  registerBtnText: { color: "#111", fontSize: 15, fontWeight: "700" },

  // Hint
  hint: {
    marginTop: 20,
    alignItems: "center",
  },
  hintText: { color: "#888", fontSize: 12 },
});
