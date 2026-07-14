import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { registerUser } from "../authService";

const FIELDS = [
  { key: "name",     label: "👤 Họ và tên",              placeholder: "Nguyễn Văn A",          keyboard: "default",       secure: false, required: true  },
  { key: "email",    label: "📧 Email",                   placeholder: "example@gmail.com",      keyboard: "email-address", secure: false, required: true  },
  { key: "password", label: "🔒 Mật khẩu",               placeholder: "Tối thiểu 6 ký tự",     keyboard: "default",       secure: true,  required: true  },
  { key: "phone",    label: "📞 Số điện thoại",           placeholder: "0901234567 (tùy chọn)", keyboard: "phone-pad",     secure: false, required: false },
  { key: "address",  label: "📍 Địa chỉ giao hàng",      placeholder: "Số nhà, đường, quận... (tùy chọn)", keyboard: "default", secure: false, required: false },
];

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ Họ tên, Email và Mật khẩu.");
      return;
    }
    if (form.password.length < 6) {
      Alert.alert("Mật khẩu quá ngắn", "Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setLoading(true);
    try {
      await registerUser(form.name, form.email, form.password, form.phone, form.address);
      Alert.alert("🎉 Thành công!", "Tài khoản đã được tạo. Hãy đăng nhập!");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Đăng ký thất bại", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brandSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>✨</Text>
            </View>
            <Text style={styles.brandName}>Tạo tài khoản</Text>
            <Text style={styles.brandTagline}>Tham gia SneakerHub ngay hôm nay!</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {FIELDS.map((field) => (
              <View key={field.key} style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  {field.label}
                  {field.required && <Text style={styles.required}> *</Text>}
                </Text>
                <View style={[styles.inputWrapper, focused === field.key && styles.inputFocused]}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder={field.placeholder}
                    placeholderTextColor="#bbb"
                    value={form[field.key]}
                    onChangeText={(v) => setForm((p) => ({ ...p, [field.key]: v }))}
                    keyboardType={field.keyboard}
                    autoCapitalize={field.key === "email" || field.key === "password" ? "none" : "words"}
                    secureTextEntry={field.secure && !showPassword}
                    onFocus={() => setFocused(field.key)}
                    onBlur={() => setFocused(null)}
                  />
                  {field.secure && (
                    <TouchableOpacity onPress={() => setShowPassword((p) => !p)} style={styles.eyeBtn}>
                      <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>Tạo tài khoản →</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>đã có tài khoản?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.replace("Login")}
            >
              <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  flex: { flex: 1 },
  bgTop: { position: "absolute", top: 0, left: 0, right: 0, height: "40%", backgroundColor: "#111" },
  bgBottom: { position: "absolute", bottom: 0, left: 0, right: 0, height: "65%", backgroundColor: "#f7f8fa" },

  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },

  brandSection: { alignItems: "center", marginBottom: 24 },
  logoCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: "#222", borderWidth: 2, borderColor: "#e94560",
    justifyContent: "center", alignItems: "center", marginBottom: 10,
  },
  logoEmoji: { fontSize: 32 },
  brandName: { fontSize: 24, fontWeight: "900", color: "#fff", letterSpacing: 0.5 },
  brandTagline: { fontSize: 13, color: "#888", marginTop: 4 },

  card: {
    backgroundColor: "#fff", borderRadius: 24, padding: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 10,
  },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: "700", color: "#555", marginBottom: 7 },
  required: { color: "#e94560" },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f5f5f5", borderRadius: 12,
    borderWidth: 1.5, borderColor: "#eee",
    paddingHorizontal: 14, minHeight: 48,
  },
  inputFocused: { borderColor: "#111", backgroundColor: "#fff" },
  input: { fontSize: 14, color: "#111", paddingVertical: 12 },
  eyeBtn: { paddingLeft: 10 },
  eyeText: { fontSize: 18 },

  registerBtn: {
    backgroundColor: "#111", borderRadius: 14, height: 52,
    justifyContent: "center", alignItems: "center", marginTop: 8,
    shadowColor: "#111", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 6,
  },
  btnDisabled: { backgroundColor: "#888" },
  registerBtnText: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },

  dividerRow: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#eee" },
  dividerText: { marginHorizontal: 10, color: "#bbb", fontSize: 12 },

  loginBtn: {
    borderWidth: 1.5, borderColor: "#111", borderRadius: 14,
    height: 48, justifyContent: "center", alignItems: "center",
  },
  loginBtnText: { color: "#111", fontSize: 15, fontWeight: "700" },
});
