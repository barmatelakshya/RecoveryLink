import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmpw7urN4GPkdJoEkWuml3wfXMgHw13hM",
  authDomain: "finalrecoverylink.firebaseapp.com",
  projectId: "finalrecoverylink",
  storageBucket: "finalrecoverylink.firebasestorage.app",
  messagingSenderId: "492151138754",
  appId: "1:492151138754:web:907dacc70bc07dbcae0e5b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
