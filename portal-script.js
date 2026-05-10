/**
 * PORTAL AUTHENTICATION SCRIPT
 * Handles patient login, registration, and view toggling.
 */

// ==========================================
// 1. DATABASE & CONFIGURATION[cite: 2]
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
// 2. VIEW MANAGEMENT (DOM TOGGLING)[cite: 2]
// ==========================================

function showDoctorAuth() {
  document.getElementById("portal-main-view").style.display = "none";
  document.getElementById("doctor-auth-view").style.display = "block";
  document.getElementById("home-button").style.display = "none";  
}

function showPatientAuth() {
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
  document.getElementById("login-form").style.display = "block"
  document.getElementById("home-button").style.display = "inline";  

  document.getElementById("auth-title").style.display = "block";
  document.getElementById("auth-subtitle").style.display = "block";
}

function toggleAuth(isSignup) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const title = document.getElementById("auth-title");
  const subtitle = document.getElementById("auth-subtitle");

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
  }
  document.getElementById("auth-error").style.display = "none";
}

function closeForgotPassword() {
  // Hide the forgot password container
  document.getElementById("forgot-password-view").style.display = "none";
  
  // Re-show the login form
  document.getElementById("login-form").style.display = "block";
  
  // Reset the titles to the Sign In defaults
  document.getElementById("auth-eyebrow").style.display = "block";
  document.getElementById("auth-eyebrow-line").style.display = "block";
  document.getElementById("auth-title").style.display = "block";
  document.getElementById("auth-subtitle").style.display = "block";
  
  // Clear any residual error messages
  document.getElementById("auth-error").style.display = "none";
}

// ==========================================
// 3. AUTO-FORMATTING LOGIC
// ==========================================

// Add event listener to format phone number as user types[cite: 1]
document.addEventListener("DOMContentLoaded", () => {

  const nameFields = ["reg-name", "doctor-login-name"];
  
  nameFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", (e) => {
        // Remove everything except letters and spaces
        e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
      });
    }
  });
  

  // Password Toggle Logic
const togglePassword = document.getElementById("toggle-reg-password");
const passwordInput = document.getElementById("reg-password");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", function () {
    // Toggle the type attribute
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    
    // Toggle the icon
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
}

const emailInput = document.getElementById("reg-email");
  if (emailInput) {
    emailInput.addEventListener("input", (e) => {
      // Remove all whitespace characters globally
      e.target.value = e.target.value.replace(/\s/g, "");
    });
  }

  const phoneInput = document.getElementById("reg-phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", (e) => {
      // Remove all non-digits
      let value = e.target.value.replace(/\D/g, "");
      
      // Limit to 10 digits
      value = value.substring(0, 10);
      
      // Apply dash formatting: XXX-XXX-XXXX
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
// 4. AUTHENTICATION LOGIC[cite: 2]
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
    return;
  }

  // Check password (assuming the field exists in the data)
if (patient.password !== passwordInput) {
    errorEl.innerText = "Incorrect password";
    errorEl.style.display = "block";
    return;
  }

  // Success logic: Use 'patient' instead of 'user'
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
    successEl.style.display = "none";
    return;
  }

  // Simulate sending an email
  errorEl.style.display = "none";
  successEl.innerText = "A password reset link has been sent to " + emailInput + ".";
  successEl.style.display = "block";

  // In a real app, the user would click a link in their email.
  // For this demo, we will automatically show the "New Password" fields after a short delay.
  setTimeout(() => {
    document.getElementById("reset-email").parentElement.style.display = "none";
    document.getElementById("reset-new-password").parentElement.style.display = "block";
    successEl.innerText = "Identity Verified. Enter your new password.";
    // Change the button text or function to handle the final update
    const actionBtn = document.querySelector("#forgot-password-view .portal-btn");
    actionBtn.innerText = "Confirm";
    actionBtn.onclick = handleFinalPasswordUpdate;
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
    return;
  }

  const patients = DB.get("patients");
  const patientIndex = patients.findIndex((p) => p.email && p.email.toLowerCase() === emailInput);

  if (patientIndex !== -1) {
    patients[patientIndex].password = newPassword;
    DB.set("patients", patients);

    successEl.innerText = "Password updated successfully!";
    successEl.style.display = "block";
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
  success.style.display = "none";

  // 1. Check for empty fields[cite: 2]
if (!emailValue || !nameValue || !phoneRaw || !dobValue || !genderValue || !addressValue) {
    err.innerText = "Please fill up all the fields.";
    err.style.display = "block";
    return;
  }

  // 2. Email Validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailValue)) {
    err.innerText = "Please enter a valid email address.";
    err.style.display = "block";
    return;
  }

if (passwordValue !== confirmPassword) {
    err.innerText = "Passwords do not match.";
    err.style.display = "block";
    return;
  }

  if (passwordValue.length < 6) {
    err.innerText = "Password must be at least 6 characters.";
    err.style.display = "block";
    return;
  }

  // 3. Phone Validation (Check for 10 digits, excluding dashes)[cite: 1]
  const digitsOnly = phoneRaw.replace(/\D/g, "");
  if (digitsOnly.length !== 10) {
    err.innerText = "Phone number must be exactly 10 digits.";
    err.style.display = "block";
    return;
  }

const finalPhoneNumber = countryCode + " " + phoneRaw;

  let patients = DB.get("patients");

  // Duplicate check[cite: 2]
  if (patients.find((p) => p.name.toLowerCase() === nameValue.toLowerCase())) {
    err.innerText = "An account with this name already exists.";
    err.style.display = "block";
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

  // Clear registration fields[cite: 2]
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
  const nameInput = document.getElementById("doctor-login-name").value.trim();
  const licenseInput = document.getElementById("doctor-login-license").value.trim();
  const doctors = DB.get("doctors");

  const doctor = doctors.find(
    (d) =>
      d.name.toLowerCase() === nameInput.toLowerCase() &&
      d.license === licenseInput
  );

  if (doctor) {
    localStorage.setItem("current_doctor_id", doctor.id);
    window.location.href = "doctor-dashboard.html";
  } else {
    const err = document.getElementById("doctor-auth-error");
    err.innerText = "Invalid credentials. Please check your name and license number.";
    err.style.display = "block";
  }
}

window.addEventListener('DOMContentLoaded', (event) => {
    // 1. Get the parameters from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');

    // 2. If the action is 'login', trigger the view change
    if (action === 'login') {
      // Hide the main portal view
      document.getElementById('portal-main-view').style.display = 'none';
      
      // Show the patient auth view
      const patientAuthView = document.getElementById('patient-auth-view');
      if (patientAuthView) {
        patientAuthView.style.display = 'block';
        document.getElementById("home-button").style.display = "none";
        
        // Find the back button inside the patient view
        // This targets the specific ghost button with the arrow icon
        const backBtn = patientAuthView.querySelector('.btn-ghost i.fa-arrow-left')?.parentElement;
        
        if (backBtn) {
            // Change the function: redirect to landing page instead of backToPortal()
            backBtn.onclick = () => window.location.href = 'index.html';
            
            // Optional: Change the icon to a home icon to better reflect the new destination
            backBtn.querySelector('i').className = 'fas fa-home';
        }

        toggleAuth(false);
      }
    }
});