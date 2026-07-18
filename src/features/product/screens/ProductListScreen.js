import React, { useEffect } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../../../store/slices/productSlice";
import ProductCard from "../components/ProductCard";

export default function ProductListScreen() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);

  console.log("PRODUCT REDUX:", products);
useEffect(() => {
  console.log("MỞ MÀN PRODUCT LIST");
  dispatch(fetchProducts());
}, [dispatch]);



  if (loading && !products.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  if (error && !products.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item._id || item.id}
        numColumns={2}
        refreshing={loading}
        onRefresh={() => dispatch(fetchProducts())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", fontSize: 16 },
});
