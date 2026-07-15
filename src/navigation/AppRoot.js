import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { login } from "../store/slices/authSlice";

import HomeScreen from "../features/home/screens/HomeScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import RegisterScreen from "../features/auth/screens/RegisterScreen";
import ProductListScreen from "../features/product/screens/ProductListScreen";
import ProductDetailScreen from "../features/product/screens/ProductDetailScreen";
import AdminDashboardScreen from "../features/product/screens/AdminDashboardScreen";
import CartScreen from "../features/cart/screens/CartScreen";
import CheckoutScreen from "../features/order/screens/CheckoutScreen";
import OrderHistoryScreen from "../features/order/screens/OrderHistoryScreen";
import ProfileScreen from "../features/profile/screens/ProfileScreen";
import ChatScreen from "../features/chat/screens/ChatScreen";

const Stack = createNativeStackNavigator();


export default function AppRoot() {
  const dispatch = useDispatch();
  const { user, isLogin } = useSelector((state) => state.auth);
  const [initializing, setInitializing] = useState(true);

  // Khôi phục session từ AsyncStorage khi app khởi động
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const userData = await AsyncStorage.getItem("userData");
        if (token && userData) {
          dispatch(login(JSON.parse(userData)));
        }
      } catch (e) {
        console.log("Lỗi khôi phục session:", e);
      } finally {
        setInitializing(false);
      }
    };
    restoreSession();
  }, []);

  // Màn hình loading khi đang khôi phục session
  if (initializing) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    );
  }

  // Xác định màn hình khởi đầu theo role
  const getInitialRoute = () => {
    if (isLogin && user?.role === "admin") return "AdminDashboard";
    return "Home";
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={getInitialRoute()}>
        {/* ===== CUSTOMER SCREENS ===== */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Products"
          component={ProductListScreen}
          options={{ title: "Sản phẩm" }}
        />
        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ title: "", headerTransparent: true }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderHistory"
          component={OrderHistoryScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatRoom"
          component={ChatScreen}
          options={{ headerShown: false }}
        />

        {/* ===== ADMIN SCREENS ===== */}
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
});
