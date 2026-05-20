import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart } from "../../../store/slices/cartSlice";

export default function CartScreen({ navigation }) {
  const cart = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Giỏ hàng</Text>

      {cart.length === 0 ? (
        <Text>Chưa có sản phẩm</Text>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>Giá: {item.price.toLocaleString("vi-VN")} VNĐ</Text>
              <TouchableOpacity onPress={() => dispatch(removeFromCart(index))}>
                <Text style={styles.remove}>Xóa</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {cart.length > 0 && (
        <TouchableOpacity style={styles.checkout} onPress={() => navigation.navigate("Checkout")}>
          <Text style={styles.checkoutText}>Thanh toán</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 30, fontWeight: "bold", marginBottom: 20 },
  card: { padding: 20, backgroundColor: "#eee", marginBottom: 15, borderRadius: 10 },
  name: { fontSize: 20, fontWeight: "bold" },
  remove: { color: "red", marginTop: 10 },
  checkout: { backgroundColor: "#111", padding: 15, borderRadius: 10, alignItems: "center" },
  checkoutText: { color: "#fff", fontSize: 18 },
});
