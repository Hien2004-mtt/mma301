import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
} from "react-native";

export default function HomeScreen({ navigation }) {
  const [countdown, setCountdown] = useState(3600); // 1 giờ

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const products = [
    {
      id: "1",
      name: "Giày Puma",
      price: "1.200.000đ",
      image: require("../../../../assets/imagePuma.png"),
    },
    {
      id: "2",
      name: "Áo Nike",
      price: "800.000đ",
      image: require("../../../../assets/imageJordan.png"),
    },
    {
      id: "3",
      name: "Giày Adidas",
      price: "500.000đ",
      image: require("../../../../assets/imageAdidas.png"),
    },
    {
      id: "4",
      name: "Giày thể thao",
      price: "2.000.000đ",
      image: require("../../../../assets/imageSport.png"),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Banner */}
      <ImageBackground
        source={require("../../../../assets/banner.png")}
        style={styles.banner}
      >
        <Text style={styles.bannerText}>SALE CUỐI NĂM lên tới 70%</Text>
      </ImageBackground>

      {/* Nút đăng nhập / đăng ký */}
      <View style={styles.authButtons}>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.authText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.authText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>

      {/* Nút khuyến mãi */}
      <View style={styles.promoButtons}>
        <TouchableOpacity style={styles.promo}>
          <Text style={styles.promoText}>Voucher 200k</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.promo}>
          <Text style={styles.promoText}>Giảm 50% Puma</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.promo}>
          <Text style={styles.promoText}>Khóa học thể thao</Text>
        </TouchableOpacity>
      </View>

      {/* Đồng hồ đếm ngược */}
      <Text style={styles.countdown}>Giờ vàng: {formatTime(countdown)}</Text>

      {/* Danh sách sản phẩm */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() =>
              navigation.navigate("ProductDetail", { product: item })
            }
          >
            {item.image && (
              <ImageBackground
                source={item.image}
                style={styles.productImage}
              />
            )}
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>{item.price}</Text>
          </TouchableOpacity>
        )}
        style={{ marginTop: 20, width: "100%" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  banner: {
    width: "100%",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 5,
  },
  authButtons: {
    flexDirection: "row",
    justifyContent: "flex-end", // đẩy cả cụm sang phải
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 15,
  },
  authButton: {
    backgroundColor: "#0066cc",
    padding: 10,
    marginLeft: 10, // tạo khoảng cách giữa 2 nút
    borderRadius: 5,
  },
  authText: { color: "#fff", fontWeight: "bold" },
  promoButtons: { flexDirection: "row", marginTop: 20 },
  promo: {
    backgroundColor: "#f00",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  promoText: { color: "#fff", fontWeight: "bold" },
  countdown: { marginTop: 20, fontSize: 18, fontWeight: "bold", color: "#333" },
  productCard: {
    flex: 1,
    backgroundColor: "#eee",
    padding: 10,
    margin: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  productImage: {
    width: 120,
    height: 120,
    marginBottom: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  productName: { fontSize: 16, fontWeight: "bold" },
  productPrice: { color: "#f00" },
  button: {
    marginTop: 30,
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 5,
  },
  buttonText: { color: "#fff", fontSize: 16 },
});
