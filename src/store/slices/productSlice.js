import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",

  initialState: {
    products: [
      {
        id: "1",
        name: "Nike Air Force 1",
        price: 2500000,
        description: "Giày Nike chính hãng",
      },

      {
        id: "2",
        name: "Adidas Ultraboost",
        price: 3200000,
        description: "Giày chạy bộ Adidas",
      },

      {
        id: "3",
        name: "Nike Jordan",
        price: 4000000,
        description: "Dòng giày Jordan cao cấp",
      },
    ],
  },

  reducers: {},
});

export default productSlice.reducer;
