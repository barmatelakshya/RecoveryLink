import { db } from "./firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

export async function createPatientProfile(uid, data) {
  await setDoc(doc(db, "patients", uid), {
    ...data,
    createdAt: new Date()
  });
}
