import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import { evaluateAlert, createAlert } from "./alertEngine.js";

export async function saveDailyCheckin(patientId, painLevel, symptoms) {
  const today = new Date().toISOString().split("T")[0];
  const docId = `${patientId}_${today}`;

  const checkinData = {
    patientId,
    date: today,
    painLevel,
    symptoms,
    createdAt: serverTimestamp()
  };

  // Save check-in
  await setDoc(doc(db, "dailyCheckins", docId), checkinData);

  // Evaluate and create alert if needed
  const alertType = evaluateAlert(painLevel, symptoms);
  
  if (alertType) {
    await createAlert(patientId, alertType, painLevel, symptoms);
    console.log(`Alert created: ${alertType} - Pain: ${painLevel}, Symptoms: ${symptoms.join(', ')}`);
  }

  return true;
}
