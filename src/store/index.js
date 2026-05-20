import { configureStore } from "@reduxjs/toolkit";

import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";


const store = configureStore({

  reducer:{

    cart: cartReducer,
    auth: authReducer,
    product: productReducer,
    order: orderReducer

  }

});


export default store;