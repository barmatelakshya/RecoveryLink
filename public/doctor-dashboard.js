import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { app } from "./firebase.js";

const db = getFirestore(app);

// 🟦 LIVE PATIENT TABLE
document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector("#patientTableBody");
  
  if (!tableBody) {
    console.error("Patient table body not found");
    return;
  }

  const q = query(
    collection(db, "checkins"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    tableBody.innerHTML = "";

    if (snapshot.empty) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #6c757d;">No patient data yet</td></tr>';
      return;
    }

    snapshot.forEach(doc => {
      const data = doc.data();

      const status =
        data.painLevel >= 8 ? "Critical" :
        data.painLevel >= 5 ? "Warning" :
        "Stable";

      const row = `
        <tr class="${status.toLowerCase()}">
          <td>${data.patientId.slice(0,6)}...</td>
          <td>${data.painLevel}/10</td>
          <td><span class="status-badge ${status.toLowerCase()}">${status}</span></td>
          <td>${(data.symptoms || []).join(", ") || "None"}</td>
        </tr>
      `;

      tableBody.innerHTML += row;
    });
  });

  // Also listen to alerts
  loadAlerts();
});

// 🟦 LIVE ALERTS
function loadAlerts() {
  const alertsContainer = document.querySelector("#alertsContainer");
  
  if (!alertsContainer) return;

  const alertsQuery = query(
    collection(db, "alerts"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(alertsQuery, (snapshot) => {
    alertsContainer.innerHTML = "";

    if (snapshot.empty) {
      alertsContainer.innerHTML = '<p style="color: #28a745;">✅ No active alerts</p>';
      return;
    }

    snapshot.forEach(doc => {
      const alert = doc.data();
      
      const alertDiv = document.createElement('div');
      alertDiv.className = `alert-card ${alert.status} ${alert.seen ? 'seen' : ''}`;
      alertDiv.innerHTML = `
        <div class="alert-header">
          <strong>${alert.status === 'critical' ? '🔴 CRITICAL' : '🟡 WARNING'}</strong>
          ${!alert.seen ? '<span class="new-badge">NEW</span>' : ''}
        </div>
        <div class="alert-body">
          Patient: ${alert.patientId.slice(0,8)}...<br>
          Pain Level: ${alert.painLevel}/10<br>
          <small>${alert.createdAt?.toDate().toLocaleString()}</small>
        </div>
      `;
      
      alertsContainer.appendChild(alertDiv);
    });
  });
}
