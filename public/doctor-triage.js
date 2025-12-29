import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import { db } from "./firebase.js";

const tableBody = document.getElementById("patientTableBody");
let allPatients = [];

// Live triage table from Firestore
const q = query(collection(db, "checkins"), orderBy("createdAt", "desc"));

onSnapshot(q, snapshot => {
  allPatients = snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
  renderPatients(allPatients);
});

function getStatus(pain) {
  if (pain >= 8) return "critical";
  if (pain >= 5) return "warning";
  return "stable";
}

function renderPatients(patients) {
  if (!tableBody) return;
  
  tableBody.innerHTML = "";

  if (patients.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #6c757d;">No patients found</td></tr>';
    return;
  }

  patients.forEach(p => {
    const status = getStatus(p.painLevel);
    const row = document.createElement('tr');
    row.className = status;
    
    row.innerHTML = `
      <td>${p.patientId.slice(0,8)}...</td>
      <td><span class="pain-level ${status}">${p.painLevel}/10</span></td>
      <td><span class="status-badge ${status}">${status.toUpperCase()}</span></td>
      <td>${(p.symptoms || []).join(", ") || "None"}</td>
      <td>
        <button class="btn-untrack" onclick="untrackPatient('${p.id}')">Untrack</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Filter buttons
window.filterPatients = function (type) {
  // Update active button
  document.querySelectorAll('.triage-controls button').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  if (type === "all") {
    renderPatients(allPatients);
  } else {
    renderPatients(
      allPatients.filter(p => getStatus(p.painLevel) === type)
    );
  }
};

// Untrack patient (removes from doctor's view)
window.untrackPatient = async function (checkinId) {
  if (!confirm("Untrack this patient from your dashboard?")) return;

  try {
    await deleteDoc(doc(db, "checkins", checkinId));
    alert("Patient untracked from dashboard");
  } catch (error) {
    console.error("Error untracking patient:", error);
    alert("Error untracking patient");
  }
};

// CSV Export (Admin-level feature)
window.exportCSV = function () {
  let csv = "Patient ID,Pain Level,Status,Symptoms,Timestamp\n";

  allPatients.forEach(p => {
    const status = getStatus(p.painLevel);
    const timestamp = p.createdAt?.toDate().toISOString() || 'Unknown';
    const row = [
      p.patientId,
      p.painLevel,
      status,
      `"${(p.symptoms || []).join(" | ")}"`,
      timestamp
    ].join(",");

    csv += row + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `doctor_patient_report_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();

  URL.revokeObjectURL(url);
  
  alert(`Exported ${allPatients.length} patient records to CSV`);
};
