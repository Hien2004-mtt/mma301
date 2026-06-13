import axiosInstance from "../../services/api/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Đăng ký tài khoản mới qua MongoDB Backend
export const registerUser = async (name, email, password, phone = "", address = "") => {
  try {
    const response = await axiosInstance.post("/auth/register", {
      name: name || email.split("@")[0], // Fallback tên nếu để trống
      email,
      password,
      phone,
      address,
    });
    
    const { token, user } = response.data;
    
    // Lưu token vào AsyncStorage để duy trì trạng thái đăng nhập
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("userData", JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Lỗi đăng ký tài khoản.";
    throw new Error(errorMsg);
  }
};

// Đăng nhập qua MongoDB Backend
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    
    const { token, user } = response.data;
    
    // Lưu token và thông tin user vào AsyncStorage
    await AsyncStorage.setItem("userToken", token);
    await AsyncStorage.setItem("userData", JSON.stringify(user));
    
    return { token, user };
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Đăng nhập thất bại.";
    throw new Error(errorMsg);
  }
};

// Đăng xuất
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
  } catch (error) {
    console.error("Lỗi khi đăng xuất:", error);
  }
};
