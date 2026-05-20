import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../services/firebase/firebaseConfig";

// Đăng ký
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log("Đăng ký thành công:", userCredential.user);
  } catch (error) {
    console.error("Lỗi đăng ký:", error.code, error.message);
  }
};

// Đăng nhập
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    console.log("Đăng nhập thành công:", userCredential.user);
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.code, error.message);
  }
};
