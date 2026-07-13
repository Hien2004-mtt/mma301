import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Tự động chọn BASE_URL theo môi trường:
 * - Web (browser):           http://localhost:5000/api
 * - Expo Go (điện thoại):    http://<IP_máy_tính>:5000/api  (tự detect)
 * - Android Emulator (AVD):  http://10.0.2.2:5000/api
 * - iOS Simulator:           http://localhost:5000/api
 */
const getBaseUrl = () => {
  // Chạy trên Web browser → dùng localhost thẳng
  if (Platform.OS === "web") {
    return "http://localhost:5000/api";
  }

  // Expo Go trên điện thoại thật → tự lấy IP từ Expo Dev Server
  const expoHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (expoHost && expoHost !== "localhost") {
    return `http://${expoHost}:5000/api`;
  }

  // Android Emulator → 10.0.2.2 trỏ về localhost máy tính
  return "http://10.0.2.2:5000/api";
};

const BASE_URL = getBaseUrl();

console.log("🔗 API Base URL:", BASE_URL); // Kiểm tra khi khởi động app

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
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
