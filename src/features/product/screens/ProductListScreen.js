import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import ProductCard from "../components/ProductCard";

const products = [
  { id: "1", name: "Giày Nike", oldPrice: 2000000, newPrice: 1500000, discount: 25, image: "https://via.placeholder.com/150" },
  { id: "2", name: "Giày Adidas", oldPrice: 1800000, newPrice: 1200000, discount: 33, image: "https://via.placeholder.com/150" },
  { id: "3", name: "Áo Puma", oldPrice: 800000, newPrice: 400000, discount: 50, image: "https://via.placeholder.com/150" },
  { id: "4", name: "Quần Jogger", oldPrice: 600000, newPrice: 450000, discount: 25, image: "https://via.placeholder.com/150" },
];

export default function ProductListScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
});
