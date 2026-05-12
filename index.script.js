// Scroll-shrink nav
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.pageYOffset > 60);
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), i * 80);
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.12
});
reveals.forEach(el => observer.observe(el));

// Auth logic
document.addEventListener("DOMContentLoaded", () => {
    const patientId = localStorage.getItem("current_patient_id");
    const authBtn = document.getElementById("auth-btn");
    const navActions = document.getElementById("nav-actions");

    if (patientId && patientId !== "0") {
        authBtn.innerText = "Sign Out";
        authBtn.style.background = "#e2e8f0";
        authBtn.style.color = "#4a5568";

        const dashBtn = document.createElement("button");
        dashBtn.innerText = "Dashboard";
        dashBtn.className = "nav-cta";
        dashBtn.onclick = () => window.location.href = 'patient-dashboard.html';
        navActions.insertBefore(dashBtn, authBtn);
    }
});

function handleAuthAction() {
    const patientId = localStorage.getItem("current_patient_id");
    if (patientId && patientId !== "0") {
        localStorage.removeItem("current_patient_id");
        window.location.reload();
    } else {
        window.location.href = 'portal.html?action=login';
    }
}

function handleBookingAction() {
    const patientId = localStorage.getItem("current_patient_id");
    if (patientId && patientId !== "0") {
        window.location.href = 'patient-dashboard.html';
    } else {
        window.location.href = 'portal.html?action=login';
    }
}