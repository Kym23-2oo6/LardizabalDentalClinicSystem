/**
 * =============================================================================
 * SITE-WIDE CONFIGURATION & SELECTORS
 * =============================================================================
 */

const nav = document.getElementById('main-nav');
const reveals = document.querySelectorAll('.reveal');

/**
 * =============================================================================
 * UI INTERACTION & ANIMATION
 * =============================================================================
 */

/**
 * Scroll-shrink navigation: 
 * Adds background/styling when page is scrolled past 60px.
 */
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.pageYOffset > 60);
});

/**
 * Content Reveal System:
 * Uses Intersection Observer to trigger entrance animations as elements 
 * enter the viewport.
 */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            // Apply a slight stagger effect based on index 'i' (80ms interval)
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12
});

reveals.forEach(el => observer.observe(el));

/**
 * =============================================================================
 * AUTHENTICATION & SESSION MANAGEMENT
 * =============================================================================
 */

/**
 * Initial UI State Setup:
 * Adjusts navigation elements based on the current user session.
 */
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    const patientId = localStorage.getItem("current_patient_id");
    const authBtn = document.getElementById("auth-btn");
    const navActions = document.getElementById("nav-actions");
    const portalBtn = document.querySelector(".footer-portal-btn");

    // Check if a valid patient session exists
    if (patientId && patientId !== "0") {
        // Update primary action button to 'Sign Out' appearance
        authBtn.innerText = "Sign Out";
        authBtn.style.background = "#e2e8f0";
        authBtn.style.color = "#4a5568";

        // Inject the Dashboard access button into the navigation bar
        const dashBtn = document.createElement("button");
        dashBtn.innerText = "Dashboard";
        dashBtn.className = "nav-cta";
        dashBtn.onclick = () => window.location.href = 'patient-dashboard.html';
        
        navActions.insertBefore(dashBtn, authBtn);

        // HIDE THE PORTAL BUTTON:
        // This ensures signed-in patients don't see the staff/admin entry point.
        if (portalBtn) {
            portalBtn.style.display = "none";
        }

        seedData();
    }
});

/**
 * =============================================================================
 * GLOBAL ACTION HANDLERS (ONCLICK EVENTS)
 * =============================================================================
 */

/**
 * Handles the login/logout flow depending on current session state.
 */
function handleAuthAction() {
    const patientId = localStorage.getItem("current_patient_id");

    if (patientId && patientId !== "0") {
        // Log out: Clear session and refresh
        localStorage.removeItem("current_patient_id");
        window.location.reload();
    } else {
        // Log in: Redirect to portal
        window.location.href = 'portal.html?action=login';
    }
}

/**
 * Directs users to the appropriate page when clicking booking-related elements.
 */
function handleBookingAction() {
    const patientId = localStorage.getItem("current_patient_id");

    if (patientId && patientId !== "0") {
        // Authorized users go directly to their dashboard
        window.location.href = 'patient-dashboard.html';
    } else {
        // Guests are sent to the login portal
        window.location.href = 'portal.html?action=login';
    }
}

// ==========================================
// DATA INITIALIZATION (SEEDING)
// ==========================================

function seedData() {
  if (DB.get("patients").length > 0) return;

  // Seed Patients
  DB.set("patients", [
    { id: 1, name: "Vets Tres", dob: "2006-12-30", gender: "Male", blood: "--", phone: "+63 909 090 9090", email: "vetstres@gmail.com", password: "tresvets", address: "Taguig City, Metro Manila", history: "Ngak", status: "Active", emergency: "09171234568" },
    { id: 2, name: "Jun Jez", dob: "2006-06-21", gender: "Male", blood: "--", phone: "+63 909 090 9090", email: "junjez@gmail.com", password: "jezjun", address: "Taguig City, Metro Manila", history: "Ngik", status: "Critical", emergency: "Liberty" },
    { id: 3, name: "Sao", dob: "2006-02-27", gender: "Male", blood: "--", phone: "+63 909 090 9090", email: "sao@gmail.com", password: "saosao", address: "Taguig City, Metro Manila", history: "Ngek", status: "Active", emergency: "" },
    { id: 4, name: "Michele", dob: "2006-01-06", gender: "Female", blood: "AB+", phone: "+63 909 090 9090", email: "michele@gmail.com", password: "gengen", address: "Taguig City, Metro Manila", history: "Wengk", status: "Active", emergency: "09111134568" }
  ]);

  // Seed Doctors
  DB.set("doctors", [
    { id: 1, name: "John Michael", spec: "General Dentistry", phone: "+63 909 090 9090", email: "jm@lardizabaldental.com", password: "michaeljohn", license: "PRC-12345", schedule: "Mon-Fri (Morning)", status: "Active" },
    { id: 2, name: "Joshua", spec: "Orthodontics", phone: "+63 909 090 9090", email: "joshua@lardizabaldental.com", password: "huajos", license: "PRC-23456", schedule: "Mon-Fri (Afternoon)", status: "Active" },
    { id: 3, name: "Kym Brian", spec: "Oral & Maxillofacial Surgery", phone: "+63 909 090 9090", email: "kym@lardizabaldental.com", password: "briankym", license: "PRC-34567", schedule: "Tue-Sat", status: "Active" }
  ]);

  const today = new Date().toISOString().split("T")[0];
  
  // Seed Appointments
  DB.set("appointments", [
    { id: 1, patient: "Vets Tres", doctor: "John Michael", date: today, time: "09:00 (AM)", reason: "General Checkup", status: "Scheduled", notes: "" },
    { id: 2, patient: "Jun Jez", doctor: "Joshua", date: today, time: "10:30 (AM)", reason: "Orthodontic Consultation", status: "Completed", notes: "" }
  ]);

  // Seed Records
  DB.set("records", [
    { id: 1, patient: "Vets Tres", doctor: "John Michael", diagnosis: "Diagnosis", prescription: "Amlodipine", notes: "", date: today, type: "Consultation" },
    { id: 2, patient: "Jun Jez", doctor: "Joshua", diagnosis: "Diagnosis", prescription: "Paracetamol PRN", notes: "", date: today, type: "Consultation" }
  ]);

  // Seed Billing
  DB.set("billing", [
    { id: 1, patient: "Vets Tres", service: "Tooth Extraction", amount: 1500, date: today, status: "Paid", method: "Cash" },
    { id: 3, patient: "Jun Jez", service: "Root Canal Therapy", amount: 2200, date: today, status: "Pending", method: "PhilHealth" }
  ]);
}

/**
 * Refined Dark Mode Toggle
 */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const storedTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial state
    document.documentElement.setAttribute('data-theme', storedTheme);
    updateIcon(storedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon(newTheme);
    });
}

function updateIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun'; // Single source of truth for the icon class
    } else {
        icon.className = 'fas fa-moon';
    }
}