import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBztSaEbqMuXHMCWKtIN9lymb4rbKDqy10",
  authDomain: "sns-flatform-26d7b.firebaseapp.com",
  projectId: "sns-flatform-26d7b",
  storageBucket: "sns-flatform-26d7b.appspot.com",
  messagingSenderId: "559526072484",
  appId: "1:559526072484:web:d27077a8bc644c6fb4d631",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const storage = getStorage(app);

export const db = getFirestore(app);
