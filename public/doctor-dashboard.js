import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  where,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmpw7urN4GPkdJoEkWuml3wfXMgHw13hM",
  authDomain: "finalrecoverylink.firebaseapp.com",
  projectId: "finalrecoverylink",
  storageBucket: "finalrecoverylink.firebasestorage.app",
  messagingSenderId: "492151138754",
  appId: "1:492151138754:web:04333947eb301d81ae0e5b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const doctorNameEl = document.getElementById("doctorName");
const greetingEl = document.getElementById("greetingText");
const tableBody = document.getElementById("checkinsTable");
const alertsList = document.getElementById("alertsList");
const totalPatientsEl = document.getElementById("totalPatients");
const activeAlertsEl = document.getElementById("activeAlerts");
const todayCheckinsEl = document.getElementById("todayCheckins");

onAuthStateChanged(auth, async (user) => {
  console.log("✅ Doctor auth fired, user:", user ? user.email : "null");
  
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  // Role validation
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists() || userDoc.data().role !== 'doctor') {
      console.warn("Access denied: not a doctor");
      await signOut(auth);
      window.location.href = "/login.html";
      return;
    }
  } catch (error) {
    console.error("Role validation failed:", error);
    window.location.href = "/login.html";
    return;
  }

  // Immediate UI update
  doctorNameEl.innerText = user.email.split("@")[0];
  
  // Set time-based greeting
  const hour = new Date().getHours();
  let greetingText = "Good Morning";
  if (hour >= 12 && hour < 17) greetingText = "Good Afternoon";
  if (hour >= 17) greetingText = "Good Evening";
  if (greetingEl) greetingEl.innerText = greetingText;

  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const userData = snap.data();
      if (userData.name) {
        doctorNameEl.innerText = userData.name;
      }
    }
  } catch (e) {
    console.warn("Doctor profile not found");
  }

  loadPatients();
  loadAlerts();
  loadStats();
});

function getStatus(pain) {
  if (pain >= 8) return "critical";
  if (pain >= 5) return "warning";
  return "stable";
}

let allPatients = [];

function loadPatients() {
  const q = query(collection(db, "checkins"), orderBy("createdAt", "desc"));

  onSnapshot(q, async (snapshot) => {
    allPatients = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    
    await renderPatients(allPatients);
    updateTodayCount(allPatients);
  });
}

async function renderPatients(patients) {
  if (!tableBody) return;
  
  tableBody.innerHTML = "";

  if (patients.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5">No check-ins yet</td></tr>`;
    return;
  }

  // Get patient names
  const patientNames = {};
  for (const p of patients.slice(0, 20)) { // Limit to 20 for performance
    if (!patientNames[p.patientId]) {
      try {
        const userDoc = await getDoc(doc(db, "users", p.patientId));
        patientNames[p.patientId] = userDoc.exists() ? userDoc.data().name || 'Unknown Patient' : 'Unknown Patient';
      } catch (error) {
        patientNames[p.patientId] = 'Unknown Patient';
      }
    }
  }

  patients.slice(0, 20).forEach(p => {
    const status = getStatus(p.pain);
    const patientName = patientNames[p.patientId] || 'Unknown Patient';
    const time = p.createdAt?.toDate()?.toLocaleString() || 'Unknown time';
    const symptoms = Array.isArray(p.symptoms) ? p.symptoms.join(', ') : (p.symptoms || 'None');
    
    let painClass = 'pain-low';
    if (p.pain >= 4 && p.pain <= 6) painClass = 'pain-medium';
    if (p.pain >= 7) painClass = 'pain-high';

    tableBody.innerHTML += `
      <tr>
        <td>${patientName}</td>
        <td><span class="pain-badge ${painClass}">${p.pain}/10</span></td>
        <td>${symptoms}</td>
        <td>${time}</td>
        <td>${p.notes || '-'}</td>
      </tr>
    `;
  });
}

function loadAlerts() {
  const q = query(
    collection(db, "alerts"), 
    where("seen", "==", false),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    if (!alertsList) return;
    
    alertsList.innerHTML = "";

    if (snapshot.empty) {
      alertsList.innerHTML = '<div class="empty-state">No active alerts</div>';
      return;
    }

    snapshot.forEach(doc => {
      const alert = doc.data();
      const alertClass = alert.level === 'CRITICAL' ? 'critical' : 'warning';
      const time = alert.createdAt?.toDate()?.toLocaleTimeString() || 'Unknown time';
      
      alertsList.innerHTML += `
        <div class="alert-card ${alertClass}" onclick="markAlertSeen('${doc.id}')">
          <strong>${alert.level}:</strong> ${alert.message}
          <br><small>Time: ${time}</small>
        </div>
      `;
    });

    // Update alerts count
    if (activeAlertsEl) {
      activeAlertsEl.textContent = snapshot.size;
    }
  });
}

function loadStats() {
  // Count total patients
  const usersQuery = query(
    collection(db, "users"),
    where("role", "==", "patient")
  );

  onSnapshot(usersQuery, (snapshot) => {
    if (totalPatientsEl) {
      totalPatientsEl.textContent = snapshot.size;
    }
  });
}

function updateTodayCount(patients) {
  if (!todayCheckinsEl) return;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayCount = patients.filter(p => {
    const checkinDate = p.createdAt?.toDate();
    return checkinDate && checkinDate >= today;
  }).length;
  
  todayCheckinsEl.textContent = todayCount;
}

window.markAlertSeen = async function(alertId) {
  try {
    await updateDoc(doc(db, "alerts", alertId), {
      seen: true,
      seenAt: new Date()
    });
  } catch (error) {
    console.error("Failed to mark alert as seen:", error);
  }
};

window.logout = async function() {
  try {
    await signOut(auth);
    window.location.href = "/login.html";
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

console.log("✅ Doctor dashboard JS loaded");
