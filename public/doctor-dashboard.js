import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ===== Firebase config (PRODUCTION) ===== */
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

/* ===== DOM ===== */
const doctorNameEl = document.getElementById("doctorName");
const tableBody = document.getElementById("patientTableBody");
const alertsList = document.getElementById("alertsList");

/* ===== State ===== */
let allRows = [];

/* ===== Helpers ===== */
function statusFromPain(pain) {
  if (pain >= 8) return "critical";
  if (pain >= 5) return "warning";
  return "stable";
}

function statusBadge(status) {
  return `<span class="badge ${status}">${status.toUpperCase()}</span>`;
}

/* ===== AUTH ===== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  // Immediate fallback
  doctorNameEl.innerText = user.email.split("@")[0];

  // Load doctor profile if exists
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      const userData = snap.data();
      if (userData.role === 'doctor' && userData.name) {
        doctorNameEl.innerText = userData.name;
      }
    }
  } catch (e) {
    console.warn("Doctor profile missing");
  }

  // Start live listeners
  listenCheckins();
  listenAlerts();
});

/* ===== LIVE TRIAGE TABLE ===== */
function listenCheckins() {
  const q = query(collection(db, "checkins"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snap) => {
    allRows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderTable(allRows);
  });
}

function renderTable(rows) {
  if (!tableBody) return;
  
  tableBody.innerHTML = "";

  if (!rows.length) {
    tableBody.innerHTML = `<tr><td colspan="6">No patients yet</td></tr>`;
    return;
  }

  rows.forEach(r => {
    const status = statusFromPain(r.painLevel || r.pain || 0);
    const painLevel = r.painLevel || r.pain || 0;
    tableBody.innerHTML += `
      <tr class="row ${status}">
        <td>${r.patientId.slice(0, 6)}</td>
        <td>${painLevel}</td>
        <td>${statusBadge(status)}</td>
        <td>${(r.symptoms || []).join(", ")}</td>
        <td>${r.createdAt?.toDate().toLocaleString() || "Now"}</td>
        <td>
          <button class="btn" onclick="openChat('${r.patientId}')">Chat</button>
          <button class="btn danger" onclick="untrack('${r.id}')">Untrack</button>
        </td>
      </tr>
    `;
  });
}

/* ===== FILTERS ===== */
window.filterPatients = (type) => {
  if (type === "all") return renderTable(allRows);
  renderTable(allRows.filter(r => statusFromPain(r.painLevel || r.pain || 0) === type));
};

/* ===== ALERTS (AUTO-GENERATED) ===== */
function listenAlerts() {
  const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));
  onSnapshot(q, (snap) => {
    if (!alertsList) return;
    
    alertsList.innerHTML = "";
    if (snap.empty) {
      alertsList.innerHTML = "<li>No alerts</li>";
      return;
    }
    snap.forEach(d => {
      const a = d.data();
      alertsList.innerHTML += `
        <li class="${a.level?.toLowerCase() || 'warning'}">
          <strong>${(a.level || 'WARNING').toUpperCase()}</strong>
          – Pain ${a.pain || a.painLevel || 'N/A'} (Patient ${a.patientId.slice(0,6)})
        </li>
      `;
    });
  });
}

/* ===== UNTRACK (local action demo) ===== */
window.untrack = async (checkinId) => {
  // For demo: log intent only. (Optional: delete doc if rules allow)
  alert("Untracked check-in: " + checkinId);
};

/* ===== CHAT HOOK ===== */
window.openChat = (patientId) => {
  alert("Open chat with patient: " + patientId);
};

/* ===== LOGOUT ===== */
window.logout = async () => {
  await signOut(auth);
  window.location.href = "/login";
};
