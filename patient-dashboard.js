import { 
  getAuth 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

// 🟦 LOG VITALS FUNCTION (COPY THIS)
async function logVitals(painLevel, symptoms) {
  const user = auth.currentUser;
  if (!user) return alert("Not logged in");

  try {
    // 1️⃣ Save check-in
    await addDoc(collection(db, "checkins"), {
      patientId: user.uid,
      painLevel: painLevel,
      symptoms: symptoms,
      createdAt: serverTimestamp()
    });

    // 2️⃣ Auto-generate alert
    if (painLevel >= 7) {
      await addDoc(collection(db, "alerts"), {
        patientId: user.uid,
        painLevel: painLevel,
        status: painLevel >= 8 ? "critical" : "warning",
        seen: false,
        createdAt: serverTimestamp()
      });
    }

    // 3️⃣ UI success state
    document.querySelector("#logBtn").disabled = true;
    document.querySelector("#logBtn").innerText = "Logged ✔";
    alert("Vitals logged successfully");

  } catch (error) {
    console.error("Error logging vitals:", error);
    alert("Error logging vitals");
  }
}

// 🟦 BUTTON CLICK BINDING
document.addEventListener('DOMContentLoaded', () => {
  const logBtn = document.querySelector("#logBtn");
  
  if (logBtn) {
    logBtn.addEventListener("click", () => {
      const painLevel = Number(document.querySelector("#painSlider").value);
      
      const symptoms = [...document.querySelectorAll(".symptom.active")]
        .map(el => el.innerText);

      logVitals(painLevel, symptoms);
    });
  }
});

// Export for use in other files
window.logVitals = logVitals;
