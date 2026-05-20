import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";

import HomeScreen from "../features/home/screens/HomeScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import RegisterScreen from "../features/auth/screens/RegisterScreen";
import ProductListScreen from "../features/product/screens/ProductListScreen";
import ProductDetailScreen from "../features/product/screens/ProductDetailScreen";

import CartScreen from "../features/cart/screens/CartScreen";
import CheckoutScreen from "../features/order/screens/CheckoutScreen"; // đúng vị trí
import OrderHistoryScreen from "../features/order/screens/OrderHistoryScreen";

const Stack = createNativeStackNavigator();

export default function AppRoot() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Products" component={ProductListScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
