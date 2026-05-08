//doctor-script.js
/**
 * DOCTOR PORTAL - CORE SCRIPT
 * File: doctor-script.js
 */

// ==========================================
// 1. DATABASE & CONFIGURATION
// ==========================================

const DB = {
  get(key) {
    return JSON.parse(localStorage.getItem("hms_" + key) || "[]");
  },
  set(key, data) {
    localStorage.setItem("hms_" + key, JSON.stringify(data));
  },
};

// Current doctor session ID
const DOCTOR_ID = parseInt(localStorage.getItem("current_doctor_id"));
let currentDoctorData = null;
let currentPage = "dashboard";
let editingRecordId = null;
let currentAppointmentId = null;

// ==========================================
// 2. UTILITY FUNCTIONS
// ==========================================

function formatDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time) {
  if (!time) return "—";
  const [hour, minute] = time.split(":");
  const h = parseInt(hour);
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayHour}:${minute} ${period}`;
}

function calcAge(dob) {
  if (!dob) return "—";
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  )
    age--;
  return age;
}

function getStatusBadge(status) {
  const map = {
    Active: "badge-green",
    Completed: "badge-green",
    Scheduled: "badge-blue",
    "On Leave": "badge-yellow",
    Critical: "badge-red",
    Cancelled: "badge-red",
    Inactive: "badge-gray",
    "No Show": "badge-gray",
    Consultation: "badge-gold",
    "Follow-up": "badge-blue",
    Emergency: "badge-red",
    Procedure: "badge-blue",
  };
  return `<span class="badge ${map[status] || "badge-gray"}">${status}</span>`;
}

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ==========================================
// 3. NAVIGATION & PAGE CONTROL
// ==========================================

function navigate(page) {
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));

  const nav = document.querySelector(`[onclick="navigate('${page}')"]`);
  if (nav) nav.classList.add("active");
  document.getElementById("page-" + page).classList.add("active");
  currentPage = page;

  const titles = {
    dashboard: ["Dashboard", "Overview of your clinical activities"],
    appointments: ["My Appointments", "Manage your appointment schedule"],
    patients: ["My Patients", "View patients you've treated"],
    records: ["Medical Records", "Clinical notes and diagnoses"],
    schedule: ["My Schedule", "View your working hours"],
    profile: ["Profile", "Your professional information"],
  };

  document.getElementById("page-title").textContent = titles[page][0];
  document.getElementById("page-subtitle").textContent = titles[page][1];

  // Render specific page content
  const renderers = {
    dashboard: renderDashboard,
    appointments: renderAppointments,
    patients: renderPatients,
    records: renderRecords,
    schedule: renderSchedule,
    profile: renderProfile,
  };
  if (renderers[page]) renderers[page]();
}

// ==========================================
// 4. SESSION & DOCTOR DATA MANAGEMENT
// ==========================================

function loadDoctorSession() {
  if (!DOCTOR_ID) {
    alert("Please log in as a doctor first.");
    window.location.href = "portal.html";
    return;
  }

  const doctors = DB.get("doctors");
  currentDoctorData = doctors.find((d) => d.id === DOCTOR_ID);

  if (!currentDoctorData) {
    // Redirect to portal if no valid session
    alert("No doctor session found. Please contact admin.");
    window.location.href = "portal.html";
    return;
  }

  // Update sidebar with doctor info
  const initials = currentDoctorData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  document.getElementById("sidebar-name").textContent = currentDoctorData.name;
  document.getElementById("sidebar-spec").textContent = currentDoctorData.spec;
  document.getElementById("sidebar-avatar").innerHTML = initials;
}

// ==========================================
// 5. DASHBOARD RENDERING
// ==========================================

function renderDashboard() {
  if (!currentDoctorData) return;

  const allAppointments = DB.get("appointments");

  const appointments = DB.get("appointments").filter(
    (a) => a.doctor === currentDoctorData.name,
  );
  const patients = DB.get("patients");
  const records = DB.get("records").filter(
    (r) => r.doctor === currentDoctorData.name,
  );

  const today = getTodayDateString();
  const todayAppts = appointments.filter(
    (a) =>
      a.date === today &&
      !["Completed", "Cancelled", "No Show"].includes(a.status),
  );

  const completedToday = appointments.filter(
    (a) => a.date === today && a.status === "Completed",
  ).length;

  // Get unique patients
  const myPatientNames = new Set(
    appointments.map((a) => a.patient).concat(records.map((r) => r.patient)),
  );
  const myPatientsCount = myPatientNames.size;

  // Stats Grid
  document.getElementById("stats-grid").innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:#e3f4ff;font-size:22px">
        <span class="icon"><i class="fas fa-calendar-check"></i></span>
      </div>
      <div class="stat-value">${todayAppts.length}</div>
      <div class="stat-label">Today's Appointments</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#dcfce7;font-size:22px">
        <span class="icon"><i class="fas fa-check-circle"></i></span>
      </div>
      <div class="stat-value">${completedToday}</div>
      <div class="stat-label">Completed Today</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#fef9c3;font-size:22px">
        <span class="icon"><i class="fas fa-users"></i></span>
      </div>
      <div class="stat-value">${myPatientsCount}</div>
      <div class="stat-label">Total Patients</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#fee2e2;font-size:22px">
        <span class="icon"><i class="fas fa-file-medical"></i></span>
      </div>
      <div class="stat-value">${records.length}</div>
      <div class="stat-label">Medical Records</div>
    </div>
  `;

  // Today's Appointments
  const todayContainer = document.getElementById("today-appointments");
  document.getElementById("today-count").textContent = todayAppts.length;

  if (todayAppts.length === 0) {
    todayContainer.innerHTML = `
      <div class="empty-appointments">
        <i class="fas fa-calendar-times"></i>
        <p>No appointments scheduled for today</p>
      </div>
    `;
  } else {
    todayContainer.innerHTML = todayAppts
      .sort((a, b) => a.time.localeCompare(b.time))
      .map((appt) => {
        const [hour, minute] = appt.time.split(":");
        const h = parseInt(hour);
        const period = h >= 12 ? "PM" : "AM";
        const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;

        return `
        <div class="appointment-card">
          <div class="appointment-time">
            <div class="time-hour">${displayHour}:${minute}</div>
            <div class="time-period">${period}</div>
          </div>
          <div class="appointment-info">
            <div class="appointment-patient">${appt.patient}</div>
            <div class="appointment-reason">${appt.reason}</div>
          </div>
          ${getStatusBadge(appt.status)}
        </div>
      `;
      })
      .join("");
  }

  // Recent Patients (from appointments/records)
  const recentPatientNames = [
    ...new Set([
      ...appointments.slice(-5).map((a) => a.patient),
      ...records.slice(-5).map((r) => r.patient),
    ]),
  ].slice(0, 5);

  const recentPatientsContainer = document.getElementById("recent-patients");
  const recentPatients = recentPatientNames
    .map((name) => patients.find((p) => p.name === name))
    .filter(Boolean);

  if (recentPatients.length === 0) {
    recentPatientsContainer.innerHTML = `
      <div class="empty-appointments">
        <i class="fas fa-user-injured"></i>
        <p>No recent patients</p>
      </div>
    `;
  } else {
    recentPatientsContainer.innerHTML = recentPatients
      .map((p) => {
        const initials = p.name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("");
        return `
        <div class="patient-card">
          <div class="patient-avatar">${initials}</div>
          <div class="patient-info">
            <div class="patient-name">${p.name}</div>
            <div class="patient-details">${p.gender} · ${calcAge(p.dob)} yrs · ${p.blood || "N/A"}</div>
          </div>
          ${getStatusBadge(p.status)}
        </div>
      `;
      })
      .join("");
  }
}

// ==========================================
// 6. APPOINTMENTS PAGE
// ==========================================

function renderAppointments() {
  if (!currentDoctorData) return;

  const q = document.getElementById("appt-search").value.toLowerCase();
  const f = document.getElementById("appt-filter").value;

  let appts = DB.get("appointments")
    .filter((a) => a.doctor === currentDoctorData.name)
    .filter(
      (a) =>
        (!q ||
          a.patient.toLowerCase().includes(q) ||
          a.reason.toLowerCase().includes(q)) &&
        (!f || a.status === f),
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const tbody = document.getElementById("appointments-tbody");
  if (appts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="icon"><span class="icon"><i class="fas fa-calendar"></i></span></div><p>No appointments found</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = appts
    .map(
      (a) => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px">A-${String(a.id).padStart(3, "0")}</td>
      <td><strong>${a.patient}</strong></td>
      <td>${formatDate(a.date)}<br><span style="font-size:12px;color:var(--text-muted)">${a.time}</span></td>
      <td style="font-size:13px">${a.reason}</td>
      <td>${getStatusBadge(a.status)}</td>
      <td class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="updateAppointmentStatus(${a.id})">Update</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function updateAppointmentStatus(id) {
  currentAppointmentId = id;
  const appt = DB.get("appointments").find((a) => a.id === id);
  if (appt) {
    document.getElementById("status-select").value = appt.status;
    document.getElementById("modal-status-overlay").style.display = "flex";
  }
}

function confirmStatusUpdate() {
  if (!currentAppointmentId) return;

  let appointments = DB.get("appointments");
  const index = appointments.findIndex((a) => a.id === currentAppointmentId);

  if (index !== -1) {
    const newStatus = document.getElementById("status-select").value;
    appointments[index].status = newStatus;
    DB.set("appointments", appointments);

    document.getElementById("modal-status-overlay").style.display = "none";
    currentAppointmentId = null;

    renderAppointments();
    if (currentPage === "dashboard") renderDashboard();
  }
}

function closeStatusModal(e) {
  if (e.target === document.getElementById("modal-status-overlay")) {
    document.getElementById("modal-status-overlay").style.display = "none";
    currentAppointmentId = null;
  }
}

// ==========================================
// 7. PATIENTS PAGE
// ==========================================

function renderPatients() {
  if (!currentDoctorData) return;

  const q = document.getElementById("patient-search").value.toLowerCase();

  // Get patients from appointments and records
  const appointments = DB.get("appointments").filter(
    (a) => a.doctor === currentDoctorData.name,
  );
  const records = DB.get("records").filter(
    (r) => r.doctor === currentDoctorData.name,
  );

  const myPatientNames = new Set([
    ...appointments.map((a) => a.patient),
    ...records.map((r) => r.patient),
  ]);

  const allPatients = DB.get("patients");
  let myPatients = allPatients
    .filter((p) => myPatientNames.has(p.name))
    .filter(
      (p) => !q || p.name.toLowerCase().includes(q) || p.phone.includes(q),
    );

  const tbody = document.getElementById("patients-tbody");
  if (myPatients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="icon"><span class="icon"><i class="fas fa-user-injured"></i></span></div><p>No patients found</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = myPatients
    .map(
      (p) => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px">P-${String(p.id).padStart(3, "0")}</td>
      <td><strong>${p.name}</strong></td>
      <td>${calcAge(p.dob)}</td>
      <td>${p.gender}</td>
      <td><span class="badge badge-blue">${p.blood || "—"}</span></td>
      <td>${p.phone}</td>
      <td>${getStatusBadge(p.status)}</td>
      <td class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="viewPatient(${p.id})">View</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function viewPatient(id) {
  const p = DB.get("patients").find((x) => x.id === id);
  const records = DB.get("records").filter(
    (r) => r.patient === p.name && r.doctor === currentDoctorData.name,
  );

  document.getElementById("view-modal-title").textContent = p.name;
  document.getElementById("view-modal-body").innerHTML = `
    <div class="detail-grid" style="margin-bottom:16px">
      <div class="detail-item"><div class="lbl">Date of Birth</div><div class="val">${formatDate(p.dob)} (Age ${calcAge(p.dob)})</div></div>
      <div class="detail-item"><div class="lbl">Gender</div><div class="val">${p.gender}</div></div>
      <div class="detail-item"><div class="lbl">Blood Type</div><div class="val">${p.blood || "—"}</div></div>
      <div class="detail-item"><div class="lbl">Phone</div><div class="val">${p.phone}</div></div>
      <div class="detail-item"><div class="lbl">Status</div><div class="val">${getStatusBadge(p.status)}</div></div>
      <div class="detail-item"><div class="lbl">Emergency Contact</div><div class="val">${p.emergency || "—"}</div></div>
      <div class="detail-item" style="grid-column:1/-1"><div class="lbl">Address</div><div class="val">${p.address || "—"}</div></div>
      <div class="detail-item" style="grid-column:1/-1"><div class="lbl">Medical History / Allergies</div><div class="val">${p.history || "None"}</div></div>
    </div>
    <div><strong style="font-size:13px">My Medical Records (${records.length})</strong>
      ${records.length ? records.map((r) => `<div style="margin-top:8px;padding:10px;background:var(--bg);border-radius:8px;font-size:13px"><strong>${r.diagnosis}</strong><br><span style="color:var(--text-muted)">${formatDate(r.date)}</span><br>${r.prescription}</div>`).join("") : '<p style="font-size:13px;color:var(--text-muted);margin-top:6px">No records</p>'}
    </div>
  `;
  document.getElementById("modal-view-overlay").style.display = "flex";
}

function closeViewModal(e) {
  if (e.target === document.getElementById("modal-view-overlay")) {
    document.getElementById("modal-view-overlay").style.display = "none";
  }
}

// ==========================================
// 8. MEDICAL RECORDS PAGE
// ==========================================

function renderRecords() {
  if (!currentDoctorData) return;

  const q = document.getElementById("record-search").value.toLowerCase();
  let records = DB.get("records")
    .filter((r) => r.doctor === currentDoctorData.name)
    .filter(
      (r) =>
        !q ||
        r.patient.toLowerCase().includes(q) ||
        r.diagnosis.toLowerCase().includes(q),
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const tbody = document.getElementById("records-tbody");
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon"><span class="icon"><i class="fas fa-clipboard"></i></span></div><p>No records found</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = records
    .map(
      (r) => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px">R-${String(r.id).padStart(3, "0")}</td>
      <td><strong>${r.patient}</strong></td>
      <td>${r.diagnosis}</td>
      <td style="font-size:13px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.prescription || "—"}</td>
      <td>${formatDate(r.date)}</td>
      <td><span class="badge badge-gray" style="font-size:10px">${r.type}</span></td>
      <td class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="viewRecord(${r.id})">View</button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function viewRecord(id) {
  const r = DB.get("records").find((x) => x.id === id);
  document.getElementById("view-modal-title").textContent = "Medical Record";
  document.getElementById("view-modal-body").innerHTML = `
    <div class="detail-grid">
      <div class="detail-item"><div class="lbl">Patient</div><div class="val"><strong>${r.patient}</strong></div></div>
      <div class="detail-item"><div class="lbl">Date</div><div class="val">${formatDate(r.date)}</div></div>
      <div class="detail-item"><div class="lbl">Type</div><div class="val">${getStatusBadge(r.type)}</div></div>
      <div class="detail-item" style="grid-column:1/-1"><div class="lbl">Diagnosis</div><div class="val">${r.diagnosis}</div></div>
      <div class="detail-item" style="grid-column:1/-1"><div class="lbl">Prescription / Treatment</div><div class="val">${r.prescription || "—"}</div></div>
      <div class="detail-item" style="grid-column:1/-1"><div class="lbl">Notes</div><div class="val">${r.notes || "—"}</div></div>
    </div>
  `;
  document.getElementById("modal-view-overlay").style.display = "flex";
}

// ==========================================
// 9. MEDICAL RECORD MODAL
// ==========================================

function openRecordModal(id = null) {
  editingRecordId = id;
  document.getElementById("modal-overlay").style.display = "flex";

  // Populate patient dropdown
  const appointments = DB.get("appointments").filter(
    (a) => a.doctor === currentDoctorData.name,
  );
  const records = DB.get("records").filter(
    (r) => r.doctor === currentDoctorData.name,
  );
  const myPatientNames = new Set([
    ...appointments.map((a) => a.patient),
    ...records.map((r) => r.patient),
  ]);

  const sel = document.getElementById("r-patient");
  sel.innerHTML =
    '<option value="">Select Patient...</option>' +
    Array.from(myPatientNames)
      .map((name) => `<option>${name}</option>`)
      .join("");

  const today = getTodayDateString();
  document.getElementById("r-date").value = today;

  // Clear fields
  ["r-diagnosis", "r-prescription", "r-notes"].forEach((id) => {
    document.getElementById(id).value = "";
  });

  document.getElementById("record-err").style.display = "none";
}

function saveRecord() {
  const patient = document.getElementById("r-patient").value;
  const diagnosis = document.getElementById("r-diagnosis").value.trim();

  if (!patient || !diagnosis) {
    return showErr("record-err", "Please fill in all required fields.");
  }

  const records = DB.get("records");
  const newId =
    records.length > 0 ? Math.max(...records.map((r) => r.id)) + 1 : 1;

  const record = {
    id: editingRecordId || newId,
    patient,
    doctor: currentDoctorData.name,
    diagnosis,
    prescription: document.getElementById("r-prescription").value,
    notes: document.getElementById("r-notes").value,
    date: document.getElementById("r-date").value,
    type: document.getElementById("r-type").value,
  };

  if (editingRecordId) {
    const idx = records.findIndex((r) => r.id === editingRecordId);
    records[idx] = record;
  } else {
    records.push(record);
  }

  DB.set("records", records);
  closeModal();
  renderRecords();
  if (currentPage === "dashboard") renderDashboard();
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = "block";
}

function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
  editingRecordId = null;
}

function closeModalOverlay(e) {
  if (e.target === document.getElementById("modal-overlay")) closeModal();
}

// ==========================================
// 10. SCHEDULE PAGE
// ==========================================

function renderSchedule() {
  if (!currentDoctorData) return;

  document.getElementById("current-schedule").textContent =
    currentDoctorData.schedule;
  document.getElementById("doctor-status").innerHTML = getStatusBadge(
    currentDoctorData.status,
  );

  // Weekly Calendar
  const appointments = DB.get("appointments").filter(
    (a) => a.doctor === currentDoctorData.name,
  );

  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Sunday

  const calendar = document.getElementById("weekly-calendar");
  let html = "";

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    const dateStr = date.toISOString().split("T")[0];
    const dayAppts = appointments.filter(
      (a) => a.date === dateStr && a.status !== "Cancelled",
    ).length;

    const isToday = dateStr === getTodayDateString();
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });

    html += `
      <div class="day-card ${isToday ? "today" : ""}">
        <div class="day-name">${dayName}</div>
        <div class="day-number">${date.getDate()}</div>
        <div class="day-appointments">${dayAppts} appt${dayAppts !== 1 ? "s" : ""}</div>
      </div>
    `;
  }

  calendar.innerHTML = html;
}

// ==========================================
// 11. PROFILE PAGE
// ==========================================

function renderProfile() {
  if (!currentDoctorData) return;

  const initials = currentDoctorData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  document.getElementById("profile-avatar").innerHTML = initials;
  document.getElementById("profile-name").textContent = currentDoctorData.name;
  document.getElementById("profile-spec").textContent = currentDoctorData.spec;
  document.getElementById("profile-phone").textContent =
    currentDoctorData.phone;
  document.getElementById("profile-email").textContent =
    currentDoctorData.email;
  document.getElementById("profile-license").textContent =
    currentDoctorData.license;
  document.getElementById("profile-schedule").textContent =
    currentDoctorData.schedule;
  document.getElementById("profile-status-badge").innerHTML = getStatusBadge(
    currentDoctorData.status,
  );
}

// ==========================================
// 12. NOTIFICATIONS (STUB)
// ==========================================

function toggleNotifications() {
  // Future implementation: Show notifications for new appointments, cancellations, etc.
  alert("Notifications feature coming soon!");
}

function logout() {
  localStorage.removeItem("current_doctor_id");
  window.location.href = "portal.html";
}

// ==========================================
// 13. INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Set current date
  const dateStr = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateEl = document.getElementById("current-date");
  if (dateEl) dateEl.textContent = dateStr;

  // Load doctor session and render dashboard
  loadDoctorSession();
  renderDashboard();
});
