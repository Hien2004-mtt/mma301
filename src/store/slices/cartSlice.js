import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [], // { id, name, price, image, size, quantity }
  },
  reducers: {
    addToCart: (state, action) => {
      const { id, size } = action.payload;
      // Nếu đã có cùng sản phẩm + cùng size → tăng quantity
      const existing = state.items.find(
        (item) => item.id === id && item.size === size
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    increaseQty: (state, action) => {
      // action.payload = { id, size }
      const item = state.items.find(
        (i) => i.id === action.payload.id && i.size === action.payload.size
      );
      if (item) item.quantity += 1;
    },
    decreaseQty: (state, action) => {
      const idx = state.items.findIndex(
        (i) => i.id === action.payload.id && i.size === action.payload.size
      );
      if (idx !== -1) {
        if (state.items[idx].quantity <= 1) {
          state.items.splice(idx, 1); // xóa nếu còn 1
        } else {
          state.items[idx].quantity -= 1;
        }
      }
    },
    removeFromCart: (state, action) => {
      // action.payload = { id, size }
      state.items = state.items.filter(
        (item) => !(item.id === action.payload.id && item.size === action.payload.size)
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, increaseQty, decreaseQty, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
