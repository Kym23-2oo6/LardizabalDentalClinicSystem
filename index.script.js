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
    const patientId = localStorage.getItem("current_patient_id");
    const authBtn = document.getElementById("auth-btn");
    const navActions = document.getElementById("nav-actions");

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