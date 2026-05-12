/**
 * PORTAL AUTHENTICATION SCRIPT
 * Handles patient login, registration, and view toggling.
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

// ==========================================
// 2. VIEW MANAGEMENT (DOM TOGGLING)
// ==========================================

function showDoctorAuth() {
  document.getElementById("portal-main-view").style.display = "none";
  document.getElementById("doctor-auth-view").style.display = "block";
  document.getElementById("home-button").style.display = "none";
}

function showPatientAuth() {
  document.getElementById("signup-header").style.display = "none";
  document.getElementById("auth-eyebrow").style.display = "block";
  document.getElementById("auth-eyebrow-line").style.display = "block";
  document.getElementById("auth-title").style.display = "block";
  document.getElementById("auth-subtitle").style.display = "block";
  document.getElementById("portal-main-view").style.display = "none";
  document.getElementById("patient-auth-view").style.display = "block";
  document.getElementById("home-button").style.display = "none";
}

function showForgotPassword() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("forgot-password-view").style.display = "block";
  document.getElementById("auth-eyebrow").style.display = "none";
  document.getElementById("auth-eyebrow-line").style.display = "none";
  document.getElementById("auth-title").style.display = "none";
  document.getElementById("auth-subtitle").style.display = "none";
}

function backToPortal() {
  document.getElementById("portal-main-view").style.display = "block";
  document.getElementById("patient-auth-view").style.display = "none";
  document.getElementById("doctor-auth-view").style.display = "none";
  document.getElementById("auth-error").style.display = "none";
  document.getElementById("doctor-auth-error").style.display = "none";
  document.getElementById("forgot-password-view").style.display = "none";
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
  document.getElementById("home-button").style.display = "inline";

  document.getElementById("auth-title").style.display = "block";
  document.getElementById("auth-subtitle").style.display = "block";

  // Reset Logic: Clear all input fields
  const inputs = document.querySelectorAll(".portal-content input");
  inputs.forEach((input) => {
    input.value = "";
  });

  // Reset Dropdowns
  const selects = document.querySelectorAll(".portal-content select");
  selects.forEach((select) => {
    select.selectedIndex = 0;
  });

  // Reset Forgot Password View state
  const resetEmailParent = document.getElementById("reset-email").parentElement;
  const newPassParent = document.getElementById("reset-new-password")?.parentElement;

  if (resetEmailParent) resetEmailParent.style.display = "block";
  if (newPassParent) newPassParent.style.display = "none";

  // Reset the action button in Forgot Password
  const actionBtn = document.querySelector("#forgot-password-view .portal-btn");
  if (actionBtn) {
    actionBtn.innerText = "Verify";
    actionBtn.onclick = handleForgotPasswordVerify;
  }

  // Clear any success messages
  const successEl = document.getElementById("auth-success");
  if (successEl) successEl.style.display = "none";
}

function toggleAuth(isSignup) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (isSignup) {
    document.getElementById("signup-header").style.display = "block";
    loginForm.style.display = "none";
    document.getElementById("auth-eyebrow").style.display = "none";
    document.getElementById("auth-eyebrow-line").style.display = "none";
    document.getElementById("auth-title").style.display = "none";
    document.getElementById("auth-subtitle").style.display = "none";
    signupForm.style.display = "grid";
  } else {
    loginForm.style.display = "block";
    signupForm.style.display = "none";
    document.getElementById("signup-header").style.display = "none";
    document.getElementById("auth-eyebrow").style.display = "block";
    document.getElementById("auth-eyebrow-line").style.display = "block";
    document.getElementById("auth-title").style.display = "block";
    document.getElementById("auth-subtitle").style.display = "block";
    document.getElementById("auth-error").style.display = "none";
  }
}

function closeForgotPassword() {
  document.getElementById("forgot-password-view").style.display = "none";
  document.getElementById("login-form").style.display = "block";
  document.getElementById("auth-eyebrow").style.display = "block";
  document.getElementById("auth-eyebrow-line").style.display = "block";
  document.getElementById("auth-title").style.display = "block";
  document.getElementById("auth-subtitle").style.display = "block";
  document.getElementById("auth-error").style.display = "none";

  const inputs = document.querySelectorAll(".portal-content input");
  inputs.forEach((input) => {
    input.value = "";
  });

  const selects = document.querySelectorAll(".portal-content select");
  selects.forEach((select) => {
    select.selectedIndex = 0;
  });

  const resetEmailParent = document.getElementById("reset-email").parentElement;
  const newPassParent = document.getElementById("reset-new-password")?.parentElement;

  if (resetEmailParent) resetEmailParent.style.display = "block";
  if (newPassParent) newPassParent.style.display = "none";

  const actionBtn = document.querySelector("#forgot-password-view .portal-btn");
  if (actionBtn) {
    actionBtn.innerText = "Verify";
    actionBtn.onclick = handleForgotPasswordVerify;
  }
}

// ==========================================
// 3. AUTO-FORMATTING LOGIC
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const toggleDoctorPass = document.getElementById("toggle-doctor-password");
  const licenseInput = document.getElementById("doctor-login-license");

  if (licenseInput) {
    licenseInput.addEventListener("input", (e) => {
      let value = e.target.value.toUpperCase();
      value = value.replace(/-/g, "");
      if (value.length > 3) {
        value = value.substring(0, 3) + "-" + value.substring(3);
      }
      e.target.value = value;
    });
  }

  if (toggleDoctorPass && licenseInput) {
    toggleDoctorPass.addEventListener("click", function () {
      const type = licenseInput.getAttribute("type") === "password" ? "text" : "password";
      licenseInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  const nameFields = ["reg-name", "doctor-login-name"];
  nameFields.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
      });
    }
  });

  const togglePassword = document.getElementById("toggle-reg-password");
  const passwordInput = document.getElementById("reg-password");
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  }

  const emailInput = document.getElementById("reg-email");
  if (emailInput) {
    emailInput.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/\s/g, "");
    });
  }

  const phoneInput = document.getElementById("reg-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      value = value.substring(0, 10);
      let formattedValue = "";
      if (value.length > 0) {
        formattedValue = value.substring(0, 3);
        if (value.length > 3) {
          formattedValue += " " + value.substring(3, 6);
        }
        if (value.length > 6) {
          formattedValue += " " + value.substring(6, 10);
        }
      }
      e.target.value = formattedValue;
    });
  }
});

// ==========================================
// 4. AUTHENTICATION LOGIC
// ==========================================

function handleLogin() {
  const emailInput = document.getElementById("login-email").value.trim().toLowerCase();
  const passwordInput = document.getElementById("login-password").value;
  const errorEl = document.getElementById("auth-error");
  const patients = DB.get("patients");

  const patient = patients.find((p) => p.email && p.email.toLowerCase() === emailInput);

  if (!patient) {
    errorEl.innerText = "Invalid email address";
    errorEl.style.display = "block";
    errorEl.style.opacity = "1";
    clearAlerts();
    return;
  }

  if (patient.password !== passwordInput) {
    errorEl.innerText = "Incorrect password";
    errorEl.style.display = "block";
    errorEl.style.opacity = "1";
    clearAlerts();
    return;
  }

  localStorage.setItem("current_patient_id", patient.id);
  window.location.href = "index.html";
}

// ==========================================
// UPDATED FORGOT PASSWORD LOGIC
// ==========================================

function handleForgotPasswordVerify() {
  const emailInput = document.getElementById("reset-email").value.trim().toLowerCase();
  const errorEl = document.getElementById("auth-error");
  const successEl = document.getElementById("auth-success");

  const patients = DB.get("patients");
  const patient = patients.find((p) => p.email && p.email.toLowerCase() === emailInput);

  if (!patient) {
    errorEl.innerText = "No account found with that email address.";
    errorEl.style.display = "block";
    errorEl.style.opacity = "1";
    successEl.style.display = "none";
    clearAlerts();
    return;
  }

  errorEl.style.display = "none";
  errorEl.style.opacity = "1";
  successEl.innerText = "A password reset link has been sent to " + emailInput + ".";
  successEl.style.display = "block";
  successEl.style.opacity = "1";
  clearAlerts();

  setTimeout(() => {
    document.getElementById("reset-email").parentElement.style.display = "none";
    document.getElementById("reset-new-password").parentElement.style.display = "block";
    successEl.innerText = "Identity verified. Enter your new password.";
    const actionBtn = document.querySelector("#forgot-password-view .portal-btn");
    actionBtn.innerText = "Confirm";
    actionBtn.onclick = handleFinalPasswordUpdate;
    clearAlerts();
  }, 3000);
}

function handleFinalPasswordUpdate() {
  const emailInput = document.getElementById("reset-email").value.trim().toLowerCase();
  const newPassword = document.getElementById("reset-new-password").value;
  const errorEl = document.getElementById("auth-error");
  const successEl = document.getElementById("auth-success");

  if (newPassword.length < 6) {
    errorEl.innerText = "Password must be at least 6 characters.";
    errorEl.style.display = "block";
    clearAlerts();
    errorEl.style.opacity = "1";
    return;
  }

  const patients = DB.get("patients");
  const patientIndex = patients.findIndex((p) => p.email && p.email.toLowerCase() === emailInput);

  if (patientIndex !== -1) {
    patients[patientIndex].password = newPassword;
    DB.set("patients", patients);

    successEl.innerText = "Password updated successfully!";
    successEl.style.display = "block";
    successEl.style.opacity = "1";
    errorEl.style.display = "none";

    setTimeout(() => {
      closeForgotPassword();
      toggleAuth(false);
    }, 2000);
  }
}

function handleSignup() {
  const emailValue = document.getElementById("reg-email").value.trim();
  const passwordValue = document.getElementById("reg-password").value;
  const confirmPassword = document.getElementById("reg-password-confirm").value;
  const nameValue = document.getElementById("reg-name").value.trim();
  const countryCode = document.getElementById("reg-country-code").value;
  const phoneRaw = document.getElementById("reg-phone").value.trim();
  const dobValue = document.getElementById("reg-dob").value;
  const genderValue = document.getElementById("reg-gender").value;
  const addressValue = document.getElementById("reg-address").value.trim();

  const err = document.getElementById("auth-error");
  const success = document.getElementById("auth-success");

  err.style.display = "none";
  err.style.opacity = "1";
  success.style.display = "none";
  success.style.opacity = "1";

  if (!emailValue || !nameValue || !phoneRaw || !dobValue || !genderValue || !addressValue) {
    err.innerText = "Please fill up all the fields.";
    err.style.display = "block";
    clearAlerts();
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailValue)) {
    err.innerText = "Please enter a valid email address.";
    err.style.display = "block";
    err.style.opacity = "1";
    clearAlerts();
    return;
  }

  if (passwordValue !== confirmPassword) {
    err.innerText = "Passwords do not match.";
    err.style.display = "block";
    err.style.opacity = "1";
    clearAlerts();
    return;
  }

  if (passwordValue.length < 6) {
    err.innerText = "Password must be at least 6 characters.";
    err.style.display = "block";
    err.style.opacity = "1";
    clearAlerts();  
    return;
  }

  const digitsOnly = phoneRaw.replace(/\D/g, "");
  if (digitsOnly.length !== 10) {
    err.innerText = "Phone number must be exactly 10 digits.";
    err.style.display = "block";
    err.style.opacity = "1";
    clearAlerts();
    return;
  }

  const finalPhoneNumber = countryCode + " " + phoneRaw;
  let patients = DB.get("patients");

  if (patients.find((p) => p.name.toLowerCase() === nameValue.toLowerCase())) {
    err.innerText = "An account with this name already exists.";
    err.style.display = "block";
    err.style.opacity = "1";
    clearAlerts();
    return;
  }

  const newId = patients.length > 0 ? Math.max(...patients.map((p) => p.id)) + 1 : 1;
  const newPatient = {
    id: newId,
    name: nameValue,
    email: emailValue,
    password: passwordValue,
    phone: finalPhoneNumber,
    dob: dobValue,
    gender: genderValue,
    address: addressValue,
    status: "Active",
    history: "",
  };

  patients.push(newPatient);
  DB.set("patients", patients);

  success.innerText = "Account created successfully! Please sign in.";
  success.style.display = "block";

  document.getElementById("reg-email").value = "";
  document.getElementById("reg-password").value = "";
  document.getElementById("reg-name").value = "";
  document.getElementById("reg-phone").value = "";
  document.getElementById("reg-dob").value = "";
  document.getElementById("reg-gender").value = "";
  document.getElementById("reg-address").value = "";

  setTimeout(() => {
    toggleAuth(false);
    document.getElementById("login-email").value = emailValue;
    success.style.display = "none";
  }, 2000);
}

function handleDoctorLogin() {
  const emailInput = document.getElementById("doctor-login-email").value.trim().toLowerCase();
  const licenseInput = document.getElementById("doctor-login-license").value.trim();
  const doctors = DB.get("doctors");

  const doctor = doctors.find(
    (d) => d.email.toLowerCase() === emailInput && d.license === licenseInput
  );

  if (doctor) {
    localStorage.setItem("current_doctor_id", doctor.id);
    window.location.href = "doctor-dashboard.html";
  } else {
    const err = document.getElementById("doctor-auth-error");
    err.innerText = "Invalid credentials. Please check your email and license number.";
    err.style.display = "block";
    err.style.opacity = "1";
    clearAlerts();
  }
}

window.addEventListener("DOMContentLoaded", (event) => {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get("action");

  if (action === "login") {
    document.getElementById("portal-main-view").style.display = "none";
    const patientAuthView = document.getElementById("patient-auth-view");
    if (patientAuthView) {
      patientAuthView.style.display = "block";
      document.getElementById("home-button").style.display = "none";
      const backBtn = patientAuthView.querySelector(".btn-ghost i.fa-arrow-left")?.parentElement;
      if (backBtn) {
        backBtn.onclick = () => (window.location.href = "index.html");
        backBtn.querySelector("i").className = "fas fa-home";
      }
      toggleAuth(false);
    }
  }
});

function openAdminModal() {
  document.getElementById("admin-modal").style.display = "flex";
  document.getElementById("admin-security-code").focus();
}

function closeAdminModal() {
  document.getElementById("admin-modal").style.display = "none";
  document.getElementById("admin-modal-error").style.display = "none";
  document.getElementById("admin-security-code").value = "";
}

function validateAdminCode() {
  const codeInput = document.getElementById("admin-security-code").value;
  const errorEl = document.getElementById("admin-modal-error");
  const secureKey = "333333";

  if (codeInput === secureKey) {
    window.location.href = "admin-dashboard.html";
  } else {
    errorEl.innerText = "Invalid security key. Access denied.";
    errorEl.style.display = "block";
    errorEl.style.opacity = "1";
    clearAlerts();
    const modal = document.querySelector(".modal-card");
    modal.style.animation = "none";
    setTimeout(() => (modal.style.animation = "shake 0.4s"), 10);
  }
}

window.onclick = function (event) {
  const modal = document.getElementById("admin-modal");
  if (event.target == modal) {
    closeAdminModal();
  }
};

function clearAlerts(delay = 3500) {
  if (window.alertTimer) clearTimeout(window.alertTimer);
  window.alertTimer = setTimeout(() => {
    const alerts = document.querySelectorAll(".alert");
    alerts.forEach((alert) => {
      alert.style.opacity = "0";
      setTimeout(() => {
        alert.style.display = "none";
      }, 500);
    });
  }, delay);
}