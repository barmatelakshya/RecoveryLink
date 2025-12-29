import { db } from "./firebase.js";
import { doc, setDoc, serverTimestamp, addDoc, collection } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

export function evaluateAlert(pain, symptoms) {
  if (pain >= 8) return "CRITICAL";

  if (pain >= 6 && symptoms.includes("Fever")) return "CRITICAL";
  if (pain >= 7 && symptoms.includes("Swelling")) return "CRITICAL";

  if (pain >= 5) return "WARNING";
  if (symptoms.includes("Dizziness")) return "WARNING";

  return null;
}

export async function createAlert(patientId, alertType, painLevel, symptoms) {
  await addDoc(collection(db, "alerts"), {
    patientId,
    doctorId: "doc_001",
    type: alertType,
    painLevel,
    symptoms,
    resolved: false,
    createdAt: serverTimestamp()
  });
}
