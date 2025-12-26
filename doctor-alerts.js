import {
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { db } from "./firebase.js";

const alertsList = document.getElementById("alertsList");
let currentFilter = "all";

// Filter buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll("[data-filter]").forEach(btn => {
    btn.onclick = () => {
      // Update active button
      document.querySelectorAll("[data-filter]").forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentFilter = btn.dataset.filter;
      renderAlerts();
    };
  });
});

let alertsCache = [];

function renderAlerts() {
  if (!alertsList) return;
  
  alertsList.innerHTML = "";

  const filteredAlerts = alertsCache.filter(a => 
    currentFilter === "all" || a.status === currentFilter
  );

  if (filteredAlerts.length === 0) {
    alertsList.innerHTML = '<li class="no-alerts">No alerts found</li>';
    return;
  }

  filteredAlerts.forEach(a => {
    const alertItem = document.createElement('li');
    alertItem.className = `alert ${a.status} ${a.seen ? 'seen' : 'new'}`;
    alertItem.innerHTML = `
      <div class="alert-content">
        <strong>${a.status.toUpperCase()}</strong> – Pain ${a.painLevel}/10<br>
        <small>Patient: ${a.patientId.slice(0,8)}...</small><br>
        <small>${a.createdAt?.toDate().toLocaleString()}</small>
      </div>
      ${!a.seen ? '<span class="new-badge">NEW</span>' : ''}
    `;
    alertsList.appendChild(alertItem);
  });
}

// Live alerts listener
const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"));

onSnapshot(q, snap => {
  alertsCache = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderAlerts();
});

// Export for use in other files
window.renderAlerts = renderAlerts;
