import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLdegUNj81UvjT1233LseTBBi8mGd2jKU",
  authDomain: "reactnative-5aa83.firebaseapp.com",
  projectId: "reactnative-5aa83",
  storageBucket: "reactnative-5aa83.firebasestorage.app",
  messagingSenderId: "995242826232",
  appId: "1:995242826232:web:d585008538f31dd2059e0d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

export { auth };
export default app;
