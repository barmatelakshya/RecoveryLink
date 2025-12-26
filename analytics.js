import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Fetch last 7 days check-ins
export async function fetchLast7Days(patientId) {
  const q = query(
    collection(db, "dailyCheckins"),
    where("patientId", "==", patientId),
    orderBy("createdAt", "desc"),
    limit(7)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

// Pain trend analysis
export function analyzePainTrend(checkins) {
  if (checkins.length === 0) return { averagePain: "0.0", trend: "NO_DATA" };
  
  const pains = checkins.map(c => c.painLevel);
  const avg = pains.reduce((a, b) => a + b, 0) / pains.length;
  
  const trend = pains[0] > pains[pains.length - 1] ? "WORSENING" : "IMPROVING";
  
  return { averagePain: avg.toFixed(1), trend };
}

// Symptom frequency analysis
export function symptomFrequency(checkins) {
  const freq = {};
  
  checkins.forEach(c => {
    c.symptoms.forEach(s => {
      freq[s] = (freq[s] || 0) + 1;
    });
  });
  
  return freq;
}

// Recovery progress calculation
export function recoveryProgress(checkins, totalDays = 14) {
  const daysCompleted = checkins.length;
  return Math.min(
    Math.round((daysCompleted / totalDays) * 100),
    100
  );
}

// Risk score assessment
export function riskScore(avgPain, alertsCount) {
  if (avgPain >= 7 || alertsCount >= 2) return "HIGH";
  if (avgPain >= 4) return "MEDIUM";
  return "LOW";
}

// Get alerts count for patient
export async function getAlertsCount(patientId) {
  const q = query(
    collection(db, "alerts"),
    where("patientId", "==", patientId),
    where("resolved", "==", false)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.size;
}

// Generate complete analytics
export async function generateAnalytics(patientId) {
  const checkins = await fetchLast7Days(patientId);
  const alertsCount = await getAlertsCount(patientId);
  const painAnalysis = analyzePainTrend(checkins);
  
  return {
    pain: painAnalysis,
    symptoms: symptomFrequency(checkins),
    progress: recoveryProgress(checkins),
    risk: riskScore(parseFloat(painAnalysis.averagePain), alertsCount),
    daysTracked: checkins.length,
    lastCheckIn: checkins.length > 0 ? checkins[0].date : null
  };
}
