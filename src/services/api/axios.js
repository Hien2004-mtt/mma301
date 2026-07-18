import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Tự động chọn BASE_URL theo môi trường:
 * - Web (browser):           http://localhost:5000/api
 * - Android Emulator (AVD):  http://10.0.2.2:5000/api
 * - Expo Go / Điện thoại thật: http://<IP LAN máy tính>:5000/api
 * - iOS Simulator:           http://localhost:5000/api
 */
const getBaseUrl = () => {
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }

  // Android Emulator
  if (Platform.OS === "android") {
    return "http://192.168.56.103:5000/api";
  }

  // Expo Go trên điện thoại thật → lấy IP LAN từ hostUri
  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (expoHost && expoHost !== "localhost") {
    return `http://${expoHost}:5000/api`;
  }

  // Fallback: dùng IP LAN thủ công nếu 10.0.2.2 không kết nối được
  return "http://192.168.1.5:5000/api"; // thay bằng IP LAN của máy bạn
};

const BASE_URL = getBaseUrl();

console.log("🔗 API Base URL:", BASE_URL);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động gắn token JWT vào Header của mọi request nếu có
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default axiosInstance;
