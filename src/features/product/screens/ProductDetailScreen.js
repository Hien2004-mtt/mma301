import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const isLoggedIn = false; // giả sử chưa đăng nhập

  const handleOrder = () => {
    if (!isLoggedIn) {
      navigation.navigate("Login");
    } else {
      alert("Đặt hàng thành công!");
    }
  };

  return (
    <View style={styles.container}>
      {product.image && (
        <Image source={product.image} style={styles.image} />
      )}
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>{product.price}</Text>
      <TouchableOpacity style={styles.button} onPress={handleOrder}>
        <Text style={styles.buttonText}>Đặt hàng</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  image: { width: 200, height: 200, marginBottom: 20, borderRadius: 10 },
  name: { fontSize: 20, fontWeight: "bold" },
  price: { fontSize: 18, color: "red", marginVertical: 10 },
  button: { backgroundColor: "black", padding: 15, borderRadius: 5 },
  buttonText: { color: "#fff", fontSize: 16 },
});
