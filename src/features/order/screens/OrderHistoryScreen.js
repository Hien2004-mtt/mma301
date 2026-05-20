import React from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

export default function OrderHistoryScreen() {
  const orders = useSelector((state) => state.order.orders);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử đơn hàng</Text>

      {orders.length === 0 ? (
        <Text>Chưa có đơn hàng</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>Đơn hàng #{item.id}</Text>
              <Text>Ngày: {item.date}</Text>
              <Text>Sản phẩm: {item.products.map((p) => p.name).join(", ")}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  card: { padding: 15, backgroundColor: "#eee", marginBottom: 15, borderRadius: 10 },
});
