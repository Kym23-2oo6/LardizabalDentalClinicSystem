//patient-script.js
/**
 * PATIENT PORTAL - CORE SCRIPT
 * File: patient-script.js
 */

// ==========================================
// 1. DATABASE & CONFIGURATION
// ==========================================

const SharedDB = {
  get(key) {
    return JSON.parse(localStorage.getItem("hms_" + key) || "[]");
  },
  set(key, data) {
    localStorage.setItem("hms_" + key, JSON.stringify(data));
  },
};

// Current patient session ID
const PATIENT_ID = parseInt(localStorage.getItem("current_patient_id")) || 0;

// ==========================================
// 2. NAVIGATION & TAB LOGIC
// ==========================================

function navigate(page) {
  // Toggle Nav Items
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));
  const navItem = document.getElementById("nav-" + page);
  if (navItem) navItem.classList.add("active");

  // Toggle Page Visibility
  document.querySelectorAll(".page").forEach((p) => {
    p.style.display = "none";
    p.classList.remove("active");
  });

  const activePage = document.getElementById("page-" + page);
  activePage.style.display = "block";
  activePage.classList.add("active");

  // Update Headers
  const titles = {
    dashboard: ["Welcome!", "Manage your health profile and dental visits."],
    records: [
      "My Records",
      "Review your appointment history and medical notes.",
    ],
  };
  document.getElementById("page-title").innerText = titles[page][0];
  document.getElementById("page-subtitle").innerText = titles[page][1];

  if (page === "records") renderPatientAppointments();
}

function switchTab(tabName) {
  // Clear Tab Buttons
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));

  // Hide Content Panes
  document.querySelectorAll(".tab-pane").forEach((p) => {
    p.style.display = "none";
    p.classList.remove("active");
  });

  // Activate Selection
  document.getElementById(`tab-${tabName}-btn`).classList.add("active");
  const targetPane = document.getElementById(`content-${tabName}`);
  targetPane.style.display = "block";
  targetPane.classList.add("active");

  // Contextual Actions
  if (tabName === "profile") loadProfileIntoForm();
  if (tabName === "appointments") renderPatientAppointments();
}

// ==========================================
// 3. PROFILE MANAGEMENT
// ==========================================

function calculateAge(dob) {
  if (!dob) return "N/A";
  const diff = Date.now() - new Date(dob).getTime();
  return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

function syncAndRenderProfile() {
  const patients = SharedDB.get("patients");
  let myData = patients.find((p) => p.id === PATIENT_ID);

  // Redirect if no session found
  if (!myData && PATIENT_ID !== 0) {
    window.location.href = "portal.html";
    return;
  }

  // Default data for new sessions
  if (!myData) {
    myData = {
      id: PATIENT_ID,
      name: "Patient",
      dob: "2000-05-15",
      gender: "Female",
      phone: "09123456789",
      status: "Active",
    };
    patients.push(myData);
    SharedDB.set("patients", patients);
  }

  // Update UI Elements
  document.getElementById("prof-name").innerText = myData.name;
  document.getElementById("footer-name").innerText = myData.name;
  document.getElementById("footer-avatar").innerText = myData.name
    .charAt(0)
    .toUpperCase();
  document.getElementById("avatar-circle").innerText = myData.name
    .charAt(0)
    .toUpperCase();
  document.getElementById("prof-age").innerText = calculateAge(myData.dob);
  document.getElementById("prof-gender").innerText = myData.gender;
  document.getElementById("prof-phone").innerText = myData.phone;
  document.getElementById("prof-blood").innerText = myData.blood || "—";
  document.getElementById("prof-address").innerText = myData.address;
}

function loadProfileIntoForm() {
  const patients = SharedDB.get("patients");
  const myData = patients.find((p) => p.id === PATIENT_ID);
  if (myData) {
    document.getElementById("edit-name").value = myData.name || "";
    document.getElementById("edit-phone").value = myData.phone || "";
    document.getElementById("edit-dob").value = myData.dob || "";
    document.getElementById("edit-gender").value = myData.gender || "Male";
    document.getElementById("edit-emergency").value = myData.emergency || "";
  }
  const emailInput = document.getElementById("edit-email-view");
  if (emailInput) {
    emailInput.value = myData.email || "";
  }
  const passwordInput = document.getElementById("edit-password-view");
  if (passwordInput) {
    passwordInput.value = myData.password || "";
  }
}

document
  .getElementById("profile-update-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    let patients = SharedDB.get("patients");
    let appointments = SharedDB.get("appointments");
    const index = patients.findIndex((p) => p.id === PATIENT_ID);

    if (index !== -1) {
      const oldName = patients[index].name;
      const newName = document.getElementById("edit-name").value;
      patients[index].name = document.getElementById("edit-name").value;
      patients[index].phone = document.getElementById("edit-phone").value;
      patients[index].dob = document.getElementById("edit-dob").value;
      patients[index].gender = document.getElementById("edit-gender").value;
      patients[index].emergency = document.getElementById("edit-emergency").value;

      appointments.forEach((appt) => {
        if (appt.patient === oldName) appt.patient = newName;
      });

      patients[index].name = newName;

      SharedDB.set("patients", patients);
      SharedDB.set("appointments", appointments);
      syncAndRenderProfile();
      alert("Profile updated successfully!");
    }
  });

// ==========================================
// 4. APPOINTMENT SYSTEM
// ==========================================

document
  .getElementById("appointment-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const patients = SharedDB.get("patients");
    const myData = patients.find((p) => p.id === PATIENT_ID);

    const newAppt = {
      id: Date.now(),
      patient: myData.name,
      doctor: document.getElementById("a-doctor").value,
      date: document.getElementById("a-date").value,
      time: document.getElementById("a-time").value,
      reason: document.getElementById("a-service").value,
      status: "Scheduled",
    };

    // Save Appointment
    let appointments = SharedDB.get("appointments");
    appointments.push(newAppt);
    SharedDB.set("appointments", appointments);

    // Trigger Admin Notification
    let notifications = SharedDB.get("notifications") || [];
    notifications.push({
      id: Date.now(),
      message: `New appointment booked by ${myData.name}`,
      patient: myData.name,
      time: new Date().toLocaleTimeString(),
      read: false,
    });
    SharedDB.set("notifications", notifications);

    alert("Appointment successfully booked!");
    this.reset();
  });

function renderPatientAppointments() {
  const patients = SharedDB.get("patients");
  const myData = patients.find((p) => p.id === PATIENT_ID);
  const myAppts = SharedDB.get("appointments").filter(
    (a) => a.patient === myData.name,
  );

  const container = document.getElementById("patient-appointments-list");
  if (myAppts.length === 0) {
    container.innerHTML =
      '<p style="text-align:center; color:var(--text-muted); padding:20px;">No appointments found.</p>';
    return;
  }

  container.innerHTML = myAppts
    .reverse()
    .map((appt) => {
      const showCancelButton =
        appt.status !== "Completed" &&
        appt.status !== "Cancelled" &&
        appt.status !== "No Show";

      return `
            <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border);">
                <div class="appt-date">
                    <div class="day">${new Date(appt.date).getDate()}</div>
                    <div class="month">${new Date(appt.date).toLocaleString(
                      "default",
                      { month: "short" },
                    )}</div>
                </div>
                <div style="flex:1">
                    <div style="font-size:14px; font-weight:600">${
                      appt.reason
                    }</div>
                    <div style="font-size:12px; color:var(--text-muted)"> ${
                      appt.doctor
                    } at ${appt.time}</div>
                </div>
                <span class="badge ${
                  appt.status === "Completed" ? "badge-green" : "badge-blue"
                }">${appt.status}</span>
                
                ${
                  showCancelButton
                    ? `<button onclick="cancelAppt(${appt.id})" class="btn btn-sm" style="color:var(--danger);">Cancel</button>`
                    : ""
                }
            </div>
        `;
    })
    .join("");
}

window.cancelAppt = function (id) {
  if (confirm("Cancel this appointment?")) {
    let appts = SharedDB.get("appointments");
    const apptToCancel = appts.find((a) => a.id == id);
    const patients = SharedDB.get("patients");
    const myData = patients.find((p) => p.id === PATIENT_ID);

    if (apptToCancel) {
      // Trigger Admin Notification for Cancellation
      let notifications = SharedDB.get("notifications") || [];
      notifications.push({
        id: Date.now(),
        message: `Appointment for ${apptToCancel.reason} was cancelled`,
        patient: myData.name,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: "cancellation",
      });
      SharedDB.set("notifications", notifications);
    }

    // Update DB and re-render
    SharedDB.set(
      "appointments",
      appts.filter((a) => a.id != id),
    );
    renderPatientAppointments();
  }
};

function isDateAllowed(dateString, scheduleString) {
  const date = new Date(dateString);
  const day = date.getDay(); // 0 (Sun) to 6 (Sat)
  const schedule = scheduleString.toLowerCase();

  // Mon-Fri: Allowed if day is 1, 2, 3, 4, or 5
  if (schedule.includes("mon-fri")) {
    return day >= 1 && day <= 5;
  }
  // Mon-Sat: Allowed if day is 1, 2, 3, 4, 5, or 6
  if (schedule.includes("mon-sat")) {
    return day >= 1 && day <= 6;
  }
  // Tue-Sat: Allowed if day is 2, 3, 4, 5, or 6
  if (schedule.includes("tue-sat")) {
    return day >= 2 && day <= 6;
  }

  return true; // Default fallback
}

function updateAvailableTimes() {
  const doctorName = document.getElementById("a-doctor").value;
  const dateInput = document.getElementById("a-date");
  const selectedDate = dateInput.value;
  const timeSelect = document.getElementById("a-time");

  // Reset if no doctor or date
  if (!doctorName || !selectedDate) {
    timeSelect.innerHTML = '<option value="">Select Doctor & Date</option>';
    return;
  }

  const doctors = SharedDB.get("doctors");
  const doctor = doctors.find((d) => d.name === doctorName);

  if (selectedDate && !isDateAllowed(selectedDate, doctor.schedule)) {
    alert(
      `${doctor.name} is not available on this day. Schedule: ${doctor.schedule}`,
    );
    dateInput.value = ""; // Clear invalid date
    timeSelect.innerHTML = '<option value="">Select Doctor & Date</option>';
    return;
  }

  if (!selectedDate) {
    timeSelect.innerHTML = '<option value="">Select Date</option>';
    return;
  }
  // Define time slots based on doctor's schedule string
  let slots = [];
  const schedule = doctor.schedule.toLowerCase();

  if (schedule.includes("morning")) {
    slots = [
      "07:30 (AM)",
      "08:00 (AM)",
      "08:30 (AM)",
      "09:00 (AM)",
      "09:30 (AM)",
      "10:00 (AM)",
      "10:30 (AM)",
      "11:00 (AM)",
      "11:30 (AM)",
    ];
  } else if (schedule.includes("afternoon")) {
    slots = [
      "13:00 (1:00 PM)",
      "13:30 (1:30 PM)",
      "14:00 (2:00 PM)",
      "14:30 (2:30 PM)",
      "15:00 (3:00 PM)",
      "15:30 (3:30 PM)",
      "16:00 (4:00 PM)",
      "16:30 (4:30 PM)",
      "17:00 (5:00 PM)",
      "17:30 (5:30 PM)",
    ];
  } else {
    // Default full day for Tue-Sat or others
    slots = [
      "09:00 (AM)",
      "10:00 (AM)",
      "11:00 (AM)",
      "13:00 (1:00 PM)",
      "14:00 (2:00 PM)",
      "15:00 (3:00 PM)",
    ];
  }

  // Filter out already booked slots for this doctor on this date
  const appointments = SharedDB.get("appointments");
  const bookedTimes = appointments
    .filter(
      (a) =>
        a.doctor === doctorName &&
        a.date === selectedDate &&
        a.status !== "Cancelled",
    )
    .map((a) => a.time);

  const availableSlots = slots.filter((time) => !bookedTimes.includes(time));

  // Render Slots
  if (availableSlots.length === 0) {
    timeSelect.innerHTML = '<option value="">No slots available</option>';
  } else {
    timeSelect.innerHTML = availableSlots
      .map((t) => `<option value="${t}">${t}</option>`)
      .join("");
  }
}

// ==========================================
// 5. INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Initial profile sync
  syncAndRenderProfile();

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("a-date").setAttribute("min", today);

  // Load doctors into selection
  const doctors = SharedDB.get("doctors");
  const doctorDropdown = document.getElementById("a-doctor");
  doctorDropdown.innerHTML =
    '<option value="">Doctor</option>' +
    doctors
      .map((d) => `<option value="${d.name}">${d.name} (${d.spec})</option>`)
      .join("");

  doctorDropdown.addEventListener("change", updateAvailableTimes);
  document
    .getElementById("a-date")
    .addEventListener("change", updateAvailableTimes);

  // Set display date
  document.getElementById("current-date").textContent =
    new Date().toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
});
/**
 * Toggles the visibility of the password request container
 */
function togglePasswordRequest() {
  const area = document.getElementById("password-request-area");
  const step1 = document.getElementById("pw-step-1");
  const step2 = document.getElementById("pw-step-2");

  const isHidden = area.style.display === "none";
  area.style.display = isHidden ? "block" : "none";

  if (isHidden) {
    step1.style.display = "block";
    step2.style.display = "none";
  }
}

/**
 * Step 1: Validates email and simulates sending a link
 */
function verifyEmailAndSend() {
  const patients = SharedDB.get("patients");
  const myData = patients.find((p) => p.id === PATIENT_ID);
  const inputEmail = document.getElementById("req-email").value;

  if (inputEmail !== myData.email) {
    alert("This email does not match our records.");
    return;
  }

  alert(
    "A link has been sent to " +
      inputEmail +
      ". You may now enter your new credentials.",
  );

  document.getElementById("pw-step-1").style.display = "none";
  document.getElementById("pw-step-2").style.display = "block";
}

/**
 * Toggles password visibility
 */
function togglePassDisplay() {
  const fields = document.querySelectorAll(".pass-field");
  const isChecked = document.getElementById("toggle-pass-visibility").checked;
  fields.forEach((f) => (f.type = isChecked ? "text" : "password"));
}

/**
 * Step 2: Final validation and update
 */
function submitPasswordChange() {
  let patients = SharedDB.get("patients");
  const index = patients.findIndex((p) => p.id === PATIENT_ID);
  const myData = patients[index];

  const oldPass = document.getElementById("req-old-pass").value;
  const newPass = document.getElementById("req-new-pass").value;

  if (oldPass !== myData.password) {
    alert("Incorrect old password.");
    return;
  }

  if (newPass.length < 6) {
    alert("New password must be at least 6 characters.");
    return;
  }

  patients[index].password = newPass;
  SharedDB.set("patients", patients);

  alert("Password updated successfully!");
  togglePasswordRequest(); // Close area
  syncAndRenderProfile(); // Refresh UI
}

function handleSignOut() {
  localStorage.removeItem("current_patient_id");
  window.location.href = "portal.html";
}