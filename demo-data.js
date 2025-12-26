import { db } from "./firebase.js";
import { collection, addDoc, setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Create demo patient data for PAT-1001
export async function createDemoPatientData() {
  try {
    const patientId = "PAT-1001";
    
    // Create patient profile
    await setDoc(doc(db, "patients", patientId), {
      name: "Demo Patient",
      email: "patient.demo@recoverylink.app",
      patientId: patientId,
      condition: "Post-Surgery Recovery",
      admissionDate: "2025-12-17",
      createdAt: serverTimestamp()
    });

    // Create sample check-ins (last 5 days)
    const checkinsData = [
      {
        patientId: patientId,
        patientName: "Demo Patient",
        painLevel: 3,
        symptoms: ["mild discomfort"],
        condition: "Post-Surgery Recovery",
        date: "2025-12-19",
        createdAt: new Date("2025-12-19T09:00:00")
      },
      {
        patientId: patientId,
        patientName: "Demo Patient", 
        painLevel: 5,
        symptoms: ["moderate pain", "stiffness"],
        condition: "Post-Surgery Recovery",
        date: "2025-12-20",
        createdAt: new Date("2025-12-20T09:00:00")
      },
      {
        patientId: patientId,
        patientName: "Demo Patient",
        painLevel: 7,
        symptoms: ["increased pain", "swelling"],
        condition: "Post-Surgery Recovery", 
        date: "2025-12-21",
        createdAt: new Date("2025-12-21T09:00:00")
      },
      {
        patientId: patientId,
        patientName: "Demo Patient",
        painLevel: 4,
        symptoms: ["improving"],
        condition: "Post-Surgery Recovery",
        date: "2025-12-22",
        createdAt: new Date("2025-12-22T09:00:00")
      },
      {
        patientId: patientId,
        patientName: "Demo Patient",
        painLevel: 2,
        symptoms: ["much better"],
        condition: "Post-Surgery Recovery",
        date: "2025-12-23",
        createdAt: new Date("2025-12-23T09:00:00")
      }
    ];

    // Add check-ins to Firestore
    for (const checkin of checkinsData) {
      await addDoc(collection(db, "checkins"), {
        ...checkin,
        createdAt: serverTimestamp()
      });
    }

    // Create a sample alert for pain level 7
    await addDoc(collection(db, "alerts"), {
      patientId: patientId,
      patientName: "Demo Patient",
      type: "WARNING",
      painLevel: 7,
      symptoms: ["increased pain", "swelling"],
      message: "Pain level increased to 7/10",
      resolved: false,
      createdAt: new Date("2025-12-21T09:00:00")
    });

    console.log("Demo patient data created successfully");
  } catch (error) {
    console.error("Error creating demo patient data:", error);
  }
}
