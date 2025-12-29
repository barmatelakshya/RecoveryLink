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
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot
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
const userNameEl = document.getElementById("patientName");
const greetingEl = document.getElementById("greetingText");
const logBtn = document.getElementById("submitCheckin");
const painLevel = document.getElementById("painLevel");
const symptomsInput = document.getElementById("symptoms");
const notesInput = document.getElementById("notes");
const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const conditionInput = document.getElementById("conditionInput");
const saveProfileBtn = document.getElementById("saveProfile");

// ===============================
// AUTH + PROFILE LOAD
// ===============================
onAuthStateChanged(auth, async (user) => {
  console.log("✅ Auth fired, user:", user ? user.email : "null");
  
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  // 🔹 Immediate fallback (NO LOADING STUCK)
  userNameEl.innerText = user.email.split("@")[0];
  
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
      userNameEl.innerText = userData.name || userNameEl.innerText;
      
      // Fill profile form if exists
      if (nameInput) nameInput.value = userData.name || '';
      if (ageInput) ageInput.value = userData.age || '';
      if (conditionInput) conditionInput.value = userData.condition || '';
    } else {
      // Create default profile
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: 'patient',
        name: '',
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.error("Profile load failed:", err);
  }

  // Generate pain scale
  generatePainScale();
});

// ===============================
// GENERATE PAIN SCALE
// ===============================
let selectedPain = null;

function generatePainScale() {
  const painScale = document.getElementById('painScale');
  if (!painScale) return;
  
  painScale.innerHTML = '';
  
  for (let i = 1; i <= 10; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pain-btn';
    btn.textContent = i;
    btn.onclick = () => selectPain(i);
    painScale.appendChild(btn);
  }
}

window.selectPain = function(level) {
  selectedPain = level;
  if (painLevel) painLevel.value = level;
  
  document.querySelectorAll('.pain-btn').forEach(btn => btn.classList.remove('selected'));
  event.target.classList.add('selected');
};

// ===============================
// LOG DAILY CHECK-IN
// ===============================
window.submitCheckin = async function() {
  const user = auth.currentUser;
  if (!user) return alert("Not logged in");
  
  if (!selectedPain) return alert("Please select your pain level");

  if (!logBtn) return;
  
  logBtn.disabled = true;
  logBtn.innerText = "Saving...";

  try {
    const symptoms = symptomsInput ? symptomsInput.value.split(',').map(s => s.trim()).filter(s => s) : [];
    const notes = notesInput ? notesInput.value : '';

    await addDoc(collection(db, "checkins"), {
      patientId: user.uid,
      pain: selectedPain,
      symptoms,
      notes,
      createdAt: serverTimestamp()
    });

    // Auto-generate alert if high pain
    if (selectedPain >= 7) {
      await addDoc(collection(db, "alerts"), {
        patientId: user.uid,
        level: selectedPain >= 8 ? 'CRITICAL' : 'WARNING',
        message: `Patient reported pain level ${selectedPain}`,
        pain: selectedPain,
        createdAt: serverTimestamp(),
        seen: false
      });
    }

    logBtn.innerText = "Check-in Submitted ✔";
    
    // Reset form
    if (symptomsInput) symptomsInput.value = '';
    if (notesInput) notesInput.value = '';
    selectedPain = null;
    document.querySelectorAll('.pain-btn').forEach(btn => btn.classList.remove('selected'));
    
    showSuccess('checkinSuccess');

  } catch (err) {
    console.error("Check-in failed:", err);
    alert("Failed to save check-in");
    logBtn.disabled = false;
    logBtn.innerText = "Submit Check-in";
  }
};

// ===============================
// SAVE PROFILE
// ===============================
window.saveProfile = async function() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const profileData = {
      name: nameInput ? nameInput.value : '',
      age: ageInput ? ageInput.value : '',
      condition: conditionInput ? conditionInput.value : '',
      email: user.email,
      role: 'patient',
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
    
    // Update UI immediately
    if (profileData.name && userNameEl) {
      userNameEl.innerText = profileData.name;
    }
    
    showSuccess('profileSuccess');
  } catch (err) {
    console.error("Profile save failed:", err);
    alert("Failed to save profile");
  }
};

// ===============================
// SHOW SUCCESS MESSAGE
// ===============================
function showSuccess(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
    setTimeout(() => {
      element.style.display = 'none';
    }, 3000);
  }
}

// ===============================
// LOGOUT
// ===============================
window.logout = async function() {
  try {
    await signOut(auth);
    window.location.href = "/login.html";
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

console.log("✅ Patient dashboard JS loaded");
