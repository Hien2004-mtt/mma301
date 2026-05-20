import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addOrder } from "../../../store/slices/orderSlice";
import { clearCart } from "../../../store/slices/cartSlice";

export default function CheckoutScreen({ navigation }) {
  const cart = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const confirmOrder = () => {
    dispatch(addOrder(cart));
    dispatch(clearCart());
    navigation.navigate("OrderHistory");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thanh toán</Text>
      <Text>Số sản phẩm: {cart.length}</Text>
      <Text style={styles.total}>Tổng tiền: {total.toLocaleString("vi-VN")} VNĐ</Text>

      <TouchableOpacity style={styles.button} onPress={confirmOrder}>
        <Text style={styles.text}>Xác nhận đặt hàng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 30, fontWeight: "bold" },
  total: { fontSize: 20, margin: 20 },
  button: { backgroundColor: "#111", padding: 15, borderRadius: 10 },
  text: { color: "#fff", fontSize: 18 },
});
