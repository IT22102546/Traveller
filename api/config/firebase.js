import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAybNwthUroUlzZaqeXWjgQ27zEyZmXONw",
  authDomain: "scout-web-app.firebaseapp.com",
  projectId: "scout-web-app",
  storageBucket: "scout-web-app.appspot.com",
  messagingSenderId: "596531107364",
  appId: "1:596531107364:web:297e92a86f187bb36feab1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };