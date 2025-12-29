import { auth } from "./firebase.js";
import { saveDailyCheckin } from "./checkin.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

// Pain slider functionality
const painSlider = document.getElementById('painSlider');
const painValue = document.querySelector('.pain-value');

function updatePainValue(value) {
  let severity, color;
  if (value <= 3) {
    severity = 'Stable';
    color = '#10b981';
  } else if (value <= 6) {
    severity = 'Moderate';
    color = '#f59e0b';
  } else {
    severity = 'Critical';
    color = '#ef4444';
  }
  painValue.textContent = `${value} • ${severity}`;
  painValue.style.color = color;
}

painSlider.addEventListener('input', (e) => {
  updatePainValue(e.target.value);
});

// Symptom chips functionality
const chips = document.querySelectorAll('.chip');
const symptomCount = document.getElementById('symptomCount');
let selectedCount = 0;

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chip.classList.toggle('active');
    selectedCount = document.querySelectorAll('.chip.active').length;
    symptomCount.textContent = selectedCount;
  });
});

// Auth state management
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in user:", user.uid);
  } else {
    console.log("No user logged in - using demo mode");
  }
});

// Log Vitals button functionality
document.querySelector('.primary-btn').addEventListener('click', async () => {
  try {
    const painLevel = document.querySelector('.slider').value;
    const selectedSymptoms = [...document.querySelectorAll('.chip.active')]
      .map(chip => chip.textContent);
    
    // Use authenticated user or demo patient
    const patientId = auth.currentUser ? auth.currentUser.uid : "demo_patient_123";
    
    await saveDailyCheckin(
      patientId,
      Number(painLevel),
      selectedSymptoms
    );
    
    alert('Vitals logged successfully!');
  } catch (error) {
    console.error('Error saving check-in:', error);
    alert('Error logging vitals. Please try again.');
  }
});
