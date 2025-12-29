import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { auth, db } from "./firebase.js";

// Initialize patient history
function initPatientHistory() {
  const timeline = document.getElementById("historyTimeline");
  
  if (!timeline) {
    console.error("History timeline element not found");
    return;
  }

  if (!auth.currentUser) {
    timeline.innerHTML = '<li class="error">Please log in to view history</li>';
    return;
  }

  // Show loading state
  timeline.innerHTML = '<li class="loading">Loading your health history...</li>';

  const q = query(
    collection(db, "checkins"),
    where("patientId", "==", auth.currentUser.uid),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snap => {
    timeline.innerHTML = "";

    if (snap.empty) {
      timeline.innerHTML = '<li class="empty">No check-ins yet. Submit your first one!</li>';
      return;
    }

    snap.forEach(doc => {
      const d = doc.data();
      const date = d.createdAt?.toDate();
      
      const listItem = document.createElement('li');
      listItem.className = 'history-item';
      
      // Pain level color coding
      let painColor = '#28a745'; // green
      if (d.painLevel >= 8) painColor = '#dc3545'; // red
      else if (d.painLevel >= 5) painColor = '#ffc107'; // yellow
      
      listItem.innerHTML = `
        <div class="history-card">
          <div class="history-header">
            <span class="history-date">${date ? date.toDateString() : 'Unknown date'}</span>
            <span class="pain-badge" style="background: ${painColor}">Pain: ${d.painLevel}/10</span>
          </div>
          <div class="history-body">
            <strong>Symptoms:</strong> ${(d.symptoms || []).join(", ") || "None reported"}
            ${d.notes ? `<br><strong>Notes:</strong> ${d.notes}` : ''}
          </div>
          <div class="history-time">
            ${date ? date.toLocaleTimeString() : ''}
          </div>
        </div>
      `;
      
      timeline.appendChild(listItem);
    });
  });
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth state
  if (auth.currentUser) {
    initPatientHistory();
  } else {
    // Listen for auth state change
    auth.onAuthStateChanged(user => {
      if (user) {
        initPatientHistory();
      }
    });
  }
});

// Export for manual initialization
window.initPatientHistory = initPatientHistory;
