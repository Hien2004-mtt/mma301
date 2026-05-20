import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function ProductCard({ product }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.oldPrice}>{product.oldPrice} VNĐ</Text>
      <Text style={styles.newPrice}>{product.newPrice} VNĐ (-{product.discount}%)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 10, padding: 10, backgroundColor: "#fff", borderRadius: 8, elevation: 3 },
  image: { width: "100%", height: 120, resizeMode: "contain" },
  name: { fontSize: 16, fontWeight: "bold", marginVertical: 5 },
  oldPrice: { textDecorationLine: "line-through", color: "#888" },
  newPrice: { color: "#f00", fontWeight: "bold", marginTop: 2 },
});
