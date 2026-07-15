import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "../../../store/slices/productSlice";
import { logout } from "../../../store/slices/authSlice";
import { logoutUser } from "../../auth/authService";

const { width } = Dimensions.get("window");

const CATEGORIES = ["Tất cả", "Nike", "Adidas", "Puma", "Jordan", "New Balance"];

const BANNERS = [
  {
    id: "1",
    bg: "#1a1a2e",
    accent: "#e94560",
    title: "SALE CUỐI NĂM",
    sub: "Giảm đến 70% tất cả sản phẩm",
    emoji: "🔥",
  },
  {
    id: "2",
    bg: "#0f3460",
    accent: "#e94560",
    title: "NIKE JUST DO IT",
    sub: "Bộ sưu tập mới nhất 2025",
    emoji: "👟",
  },
  {
    id: "3",
    bg: "#16213e",
    accent: "#f5a623",
    title: "ADIDAS ORIGINALS",
    sub: "Phong cách đường phố cực chất",
    emoji: "⚡",
  },
];

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [activeBanner, setActiveBanner] = useState(0);
  const [countdown, setCountdown] = useState(3600);

  const bannerRef = useRef(null);
  const bannerTimer = useRef(null);

  const { products, loading } = useSelector((state) => state.product);
  const { user, isLogin } = useSelector((state) => state.auth);
  const cartCount = useSelector((state) => state.cart.items.length);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Auto-scroll banner
  useEffect(() => {
    bannerTimer.current = setInterval(() => {
      setActiveBanner((prev) => {
        const next = (prev + 1) % BANNERS.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(bannerTimer.current);
  }, []);

  // Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return { h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(sec).padStart(2, "0") };
  };

  const time = formatTime(countdown);

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logout());
  };

  const getImageSource = (image) => {
    if (!image) return null;
    if (typeof image === "string" && (image.startsWith("http://") || image.startsWith("https://"))) {
      return { uri: image };
    }
    if (typeof image === "number" || typeof image === "object") return image;
    return null;
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat =
      selectedCategory === "Tất cả" ||
      p.name.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchSearch && matchCat;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111" />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLogo}>👟 SneakerHub</Text>
          <Text style={styles.headerSub}>
            {isLogin ? `Xin chào, ${user?.name?.split(" ").pop() || "bạn"} 👋` : "Khám phá giày mới"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          {isLogin && user?.role === "admin" && (
            <TouchableOpacity
              style={styles.adminChip}
              onPress={() => navigation.navigate("AdminDashboard")}
            >
              <Text style={styles.adminChipText}>⚙️ Admin</Text>
            </TouchableOpacity>
          )}
          {isLogin ? (
            <>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate("ChatRoom")}
              >
                <Text style={styles.iconBtnText}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate("Profile")}
              >
                <Text style={styles.iconBtnText}>👤</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
                <Text style={styles.iconBtnText}>🚪</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.loginChip}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginChipText}>Đăng nhập</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={() => navigation.navigate("Cart")}
          >
            <Text style={styles.cartBtnText}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ===== SEARCH BAR ===== */}
        <View style={styles.searchWrapper}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm giày..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ===== BANNER CAROUSEL ===== */}
        <FlatList
          ref={bannerRef}
          data={BANNERS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveBanner(idx);
          }}
          renderItem={({ item }) => (
            <View style={[styles.bannerCard, { backgroundColor: item.bg, width }]}>
              <Text style={styles.bannerEmoji}>{item.emoji}</Text>
              <View>
                <Text style={[styles.bannerTitle, { color: item.accent }]}>{item.title}</Text>
                <Text style={styles.bannerSub}>{item.sub}</Text>
              </View>
            </View>
          )}
        />
        {/* Dots */}
        <View style={styles.dotsRow}>
          {BANNERS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, activeBanner === i && styles.dotActive]}
            />
          ))}
        </View>

        {/* ===== FLASH SALE ===== */}
        <View style={styles.flashSaleRow}>
          <View style={styles.flashSaleLeft}>
            <Text style={styles.flashSaleLabel}>⚡ Flash Sale</Text>
          </View>
          <View style={styles.countdownRow}>
            <View style={styles.timeBox}><Text style={styles.timeNum}>{time.h}</Text></View>
            <Text style={styles.timeSep}>:</Text>
            <View style={styles.timeBox}><Text style={styles.timeNum}>{time.m}</Text></View>
            <Text style={styles.timeSep}>:</Text>
            <View style={styles.timeBox}><Text style={styles.timeNum}>{time.s}</Text></View>
          </View>
          {isLogin && (
            <TouchableOpacity onPress={() => navigation.navigate("OrderHistory")}>
              <Text style={styles.myOrderLink}>📦 Đơn của tôi</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ===== CATEGORIES ===== */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ===== PRODUCT GRID ===== */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === "Tất cả" ? "🛍️ Tất cả sản phẩm" : `🔎 "${selectedCategory}"`}
          </Text>
          <Text style={styles.sectionCount}>{filteredProducts.length} sản phẩm</Text>
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>😕</Text>
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
          </View>
        ) : (
          <View style={styles.productsGrid}>
            {filteredProducts.map((item) => {
              const imgSrc = getImageSource(item.image);
              return (
                <TouchableOpacity
                  key={item._id || item.id}
                  style={styles.productCard}
                  onPress={() => navigation.navigate("ProductDetail", { product: item })}
                  activeOpacity={0.85}
                >
                  <View style={styles.productImageWrapper}>
                    {item.discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>-{item.discount}%</Text>
                      </View>
                    )}
                    {imgSrc ? (
                      <Image source={imgSrc} style={styles.productImage} />
                    ) : (
                      <Text style={styles.productImageFallback}>👟</Text>
                    )}
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productNewPrice}>
                      {item.newPrice?.toLocaleString("vi-VN")}đ
                    </Text>
                    {item.oldPrice && item.oldPrice !== item.newPrice && (
                      <Text style={styles.productOldPrice}>
                        {item.oldPrice?.toLocaleString("vi-VN")}đ
                      </Text>
                    )}
                    {/* Hiển thị số lượng còn / hết hàng */}
                    {item.stock === 0 ? (
                      <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>Hết hàng</Text>
                      </View>
                    ) : (
                      <Text style={styles.stockText}>Còn: {item.stock !== undefined ? item.stock : 10} đôi</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = (width - 36) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f8fa" },

  // Header
  header: {
    backgroundColor: "#111",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
  },
  headerLogo: { fontSize: 20, fontWeight: "900", color: "#fff", letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: "#aaa", marginTop: 2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  adminChip: {
    backgroundColor: "#cc0000",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  adminChipText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  loginChip: {
    backgroundColor: "#0066cc",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  loginChipText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnText: { fontSize: 17 },
  cartBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBtnText: { fontSize: 17 },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#e94560",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },

  // Search
  searchWrapper: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "#111" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: "#fff" },
  clearBtn: { color: "#999", fontSize: 14, paddingLeft: 8 },

  // Banner
  bannerCard: {
    height: 150,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
  },
  bannerEmoji: { fontSize: 70 },
  bannerTitle: { fontSize: 22, fontWeight: "900", letterSpacing: 1 },
  bannerSub: { fontSize: 13, color: "#ccc", marginTop: 4, maxWidth: 180 },
  dotsRow: { flexDirection: "row", justifyContent: "center", marginVertical: 8, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#ccc" },
  dotActive: { width: 20, backgroundColor: "#111" },

  // Flash Sale
  flashSaleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginBottom: 2,
  },
  flashSaleLeft: {},
  flashSaleLabel: { fontSize: 16, fontWeight: "900", color: "#e94560" },
  countdownRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeBox: {
    backgroundColor: "#111",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 32,
    alignItems: "center",
  },
  timeNum: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  timeSep: { color: "#111", fontWeight: "bold", fontSize: 16 },
  myOrderLink: { color: "#0066cc", fontSize: 13, fontWeight: "bold" },

  // Categories
  categoriesContainer: { paddingHorizontal: 14, paddingVertical: 12, gap: 8, backgroundColor: "#fff" },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    borderWidth: 1.5,
    borderColor: "#f0f0f0",
  },
  categoryChipActive: { backgroundColor: "#111", borderColor: "#111" },
  categoryText: { fontSize: 13, color: "#555", fontWeight: "600" },
  categoryTextActive: { color: "#fff" },

  // Section header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  sectionCount: { fontSize: 13, color: "#999" },

  // Product grid
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 10,
    gap: 10,
    justifyContent: "space-between",
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 4,
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "#e94560",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  productImageWrapper: {
    backgroundColor: "#f8f8f8",
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  productImageFallback: { fontSize: 60 },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: "700", color: "#222", lineHeight: 18, marginBottom: 6 },
  productNewPrice: { fontSize: 15, fontWeight: "900", color: "#e94560" },
  productOldPrice: {
    fontSize: 12,
    color: "#bbb",
    textDecorationLine: "line-through",
    marginTop: 2,
  },

  // Stock styles
  outOfStockBadge: {
    backgroundColor: "#ffebeb",
    borderColor: "#ffcccc",
    borderWidth: 1,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  outOfStockText: {
    color: "#ff3b30",
    fontSize: 10,
    fontWeight: "bold",
  },
  stockText: {
    color: "#4cd964",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 50 },
  emptyIcon: { fontSize: 50, marginBottom: 12 },
  emptyText: { fontSize: 16, color: "#999" },
});
