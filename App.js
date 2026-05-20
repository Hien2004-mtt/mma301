import React from "react";
import { Provider } from "react-redux";

import store from "./src/store";
import AppRoot from "./src/navigation/AppRoot";


export default function App(){

  return(
    <Provider store={store}>
      <AppRoot/>
    </Provider>
  );

}