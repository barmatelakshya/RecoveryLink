// ===============================
// Firebase imports (MODULE MODE)
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ===============================
// Firebase config (PRODUCTION)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyCmpw7urN4GPkdJoEkWuml3wfXMgHw13hM",
  authDomain: "finalrecoverylink.firebaseapp.com",
  projectId: "finalrecoverylink",
  storageBucket: "finalrecoverylink.firebasestorage.app",
  messagingSenderId: "492151138754",
  appId: "1:492151138754:web:04333947eb301d81ae0e5b"
};

// ===============================
// Init Firebase
// ===============================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// DOM Elements
// ===============================
const userNameEl = document.getElementById("userName");
const recoveryStatusEl = document.getElementById("recoveryStatus");
const painTrendEl = document.getElementById("painTrend");
const lastCheckinEl = document.getElementById("lastCheckin");
const daysTrackedEl = document.getElementById("daysTracked");
const historyContainer = document.getElementById("historyContainer");
const painSlider = document.getElementById("painSlider");
const symptomButtons = document.querySelectorAll(".symptom-chip");
const logVitalsBtn = document.getElementById("logVitalsBtn");

// ===============================
// GLOBAL STATE
// ===============================
let currentUser = null;
let selectedSymptoms = [];

// ===============================
// AUTH HANDLER
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login";
    return;
  }

  currentUser = user;

  // Immediate fallback name
  userNameEl.innerText = user.email.split("@")[0];

  // Fetch profile
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (snap.exists()) {
      userNameEl.innerText = snap.data().name || userNameEl.innerText;
    }
  } catch (e) {
    console.warn("Patient profile missing");
  }

  loadHistory();
});

// ===============================
// SAVE DAILY CHECK-IN
// ===============================
logVitalsBtn?.addEventListener("click", async () => {
  if (!currentUser) return;

  logVitalsBtn.disabled = true;
  logVitalsBtn.innerText = "Saving...";

  const painLevel = Number(painSlider.value);

  try {
    await addDoc(collection(db, "checkins"), {
      patientId: currentUser.uid,
      painLevel,
      symptoms: selectedSymptoms,
      createdAt: serverTimestamp()
    });

    logVitalsBtn.innerText = "Saved ✓";
    setTimeout(() => {
      logVitalsBtn.disabled = false;
      logVitalsBtn.innerText = "Log Vitals";
    }, 1500);

  } catch (err) {
    alert("Failed to save vitals");
    logVitalsBtn.disabled = false;
    logVitalsBtn.innerText = "Log Vitals";
  }
});

// ===============================
// LOAD HISTORY (LIVE)
// ===============================
function loadHistory() {
  const q = query(
    collection(db, "checkins"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    if (!historyContainer) return;
    
    historyContainer.innerHTML = "";

    if (snapshot.empty) {
      historyContainer.innerHTML = "<p>No history yet</p>";
      return;
    }

    let days = 0;

    snapshot.forEach(docSnap => {
      const d = docSnap.data();

      if (d.patientId !== currentUser.uid) return;

      days++;

      const date = d.createdAt?.toDate().toLocaleDateString() || "Today";

      historyContainer.innerHTML += `
        <div class="history-item">
          <strong>${date}</strong>
          <span>Pain: ${d.painLevel}</span>
          <span>${d.symptoms.join(", ")}</span>
        </div>
      `;
    });

    if (daysTrackedEl) daysTrackedEl.innerText = days;
    if (recoveryStatusEl) recoveryStatusEl.innerText = "Active";
    if (painTrendEl) painTrendEl.innerText = "Tracking";
    if (lastCheckinEl) lastCheckinEl.innerText = "Updated";
  });
}

// ===============================
// SYMPTOM SELECT
// ===============================
symptomButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const val = btn.dataset.symptom;

    if (selectedSymptoms.includes(val)) {
      selectedSymptoms = selectedSymptoms.filter(s => s !== val);
      btn.classList.remove("active");
    } else {
      selectedSymptoms.push(val);
      btn.classList.add("active");
    }
  });
});

// ===============================
// LOGOUT
// ===============================
window.logout = async () => {
  await signOut(auth);
  window.location.href = "/login";
};
