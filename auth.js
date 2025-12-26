import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Demo credentials
const DEMO_ACCOUNTS = {
  patient: {
    email: "patient.demo@recoverylink.app",
    password: "Patient@123",
    role: "patient",
    patientId: "PAT-1001"
  },
  doctor: {
    email: "doctor.demo@recoverylink.app", 
    password: "Doctor@123",
    role: "doctor",
    doctorId: "DOC-9001"
  }
};

export async function registerPatient(email, password) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user.uid;
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      localStorage.setItem("role", userData.role);
      
      // Redirect based on role
      if (userData.role === "patient") {
        window.location.href = "patient.html";
      } else if (userData.role === "doctor") {
        window.location.href = "doctor.html";
      }
      
      return userData;
    } else {
      throw new Error("User role not found");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function createDemoAccounts() {
  try {
    // Create patient demo account
    const patientCred = await createUserWithEmailAndPassword(
      auth, 
      DEMO_ACCOUNTS.patient.email, 
      DEMO_ACCOUNTS.patient.password
    );
    
    await setDoc(doc(db, "users", patientCred.user.uid), {
      email: DEMO_ACCOUNTS.patient.email,
      role: DEMO_ACCOUNTS.patient.role,
      patientId: DEMO_ACCOUNTS.patient.patientId,
      name: "Demo Patient",
      createdAt: new Date()
    });

    // Create doctor demo account  
    const doctorCred = await createUserWithEmailAndPassword(
      auth,
      DEMO_ACCOUNTS.doctor.email,
      DEMO_ACCOUNTS.doctor.password
    );
    
    await setDoc(doc(db, "users", doctorCred.user.uid), {
      email: DEMO_ACCOUNTS.doctor.email,
      role: DEMO_ACCOUNTS.doctor.role,
      doctorId: DEMO_ACCOUNTS.doctor.doctorId,
      name: "Demo Doctor",
      createdAt: new Date()
    });

    console.log("Demo accounts created successfully");
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("Demo accounts already exist");
    } else {
      console.error("Error creating demo accounts:", error);
    }
  }
}
