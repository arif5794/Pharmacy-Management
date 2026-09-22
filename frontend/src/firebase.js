import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace this object with the web app config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBB1qCZ6Dy8oaB_9s7gDGH_IQZtWn4OQYM",
  authDomain: "echopharma-system.firebaseapp.com",
  projectId: "echopharma-system",
  storageBucket: "echopharma-system.appspot.com",
  messagingSenderId: "670985969336",
  appId: "1:670985969336:web:9e1fe13df35a00b6d25e4d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);