import { createSlice } from "@reduxjs/toolkit";

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
  },
  reducers: {
    addOrder: (state, action) => {
      state.orders.push({
        id: Date.now(),
        products: action.payload,
        date: new Date().toLocaleDateString(),
      });
    },
  },
});

export const { addOrder } = orderSlice.actions;
export default orderSlice.reducer;
