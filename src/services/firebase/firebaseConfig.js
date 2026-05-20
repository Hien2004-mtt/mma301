import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDMVMWaIiteAPFCBNX-2cBxraqP6rIj1o4",
  authDomain: "project-mma301-3bc5e.firebaseapp.com",
  projectId: "project-mma301-3bc5e",
  storageBucket: "project-mma301-3bc5e.appspot.com",
  messagingSenderId: "1049831293476",
  appId: "1:1049831293476:web:b495bec44c267e3c65ceb1",
  measurementId: "G-3PYQ3F43TJ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
