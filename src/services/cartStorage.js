import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveCart = async (cart) => {
  try {
    await AsyncStorage.setItem("cart", JSON.stringify(cart));
  } catch (e) {
    console.log(e);
  }
};

export const getCart = async () => {
  try {
    const data = await AsyncStorage.getItem("cart");

    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};
