import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: null,

    isLogin: false,
  },

  reducers: {
    login: (state, action) => {
      state.user = action.payload;

      state.isLogin = true;
    },

    logout: (state) => {
      state.user = null;

      state.isLogin = false;
    },
  },
});

export const {
  login,

  logout,
} = authSlice.actions;

export default authSlice.reducer;
