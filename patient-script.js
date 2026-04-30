const SharedDB = {
    get(key) { return JSON.parse(localStorage.getItem('hms_' + key) || '[]'); },
    set(key, data) { localStorage.setItem('hms_' + key, JSON.stringify(data)); }
};

// Change this line in your patient-script.js[cite: 5]
const PATIENT_ID = parseInt(localStorage.getItem('current_patient_id')) || 0;

// Update the syncAndRenderProfile function to handle missing data gracefully
function syncAndRenderProfile() {
    const patients = SharedDB.get('patients');
    let myData = patients.find(p => p.id === PATIENT_ID);

    if (!myData) {
        // Redirect back to portal if no session is found
        window.location.href = 'portal.html';
        return;
    }

    // Existing render logic remains same...[cite: 5]
    document.getElementById('prof-name').innerText = myData.name;
    document.getElementById('footer-name').innerText = myData.name;
    document.getElementById('footer-avatar').innerText = myData.name.charAt(0).toUpperCase();
    document.getElementById('avatar-circle').innerText = myData.name.charAt(0).toUpperCase();
    document.getElementById('prof-age').innerText = calculateAge(myData.dob);
    document.getElementById('prof-gender').innerText = myData.gender;
    document.getElementById('prof-phone').innerText = myData.phone;
}

// --- NAVIGATION LOGIC ---
function navigate(page) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const navItem = document.getElementById('nav-' + page);
    if(navItem) navItem.classList.add('active');

    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });
    
    const activePage = document.getElementById('page-' + page);
    activePage.style.display = 'block';
    activePage.classList.add('active');

    const titles = {
        dashboard: ['Welcome!', 'Manage your health profile and dental visits.'],
        records: ['My Records', 'Review your appointment history and medical notes.']
    };
    document.getElementById('page-title').innerText = titles[page][0];
    document.getElementById('page-subtitle').innerText = titles[page][1];

    if (page === 'records') renderPatientAppointments();
}

// --- TAB SWITCHING LOGIC (Standardized) ---
function switchTab(tabName) {
    // 1. Clear Tab Buttons
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    
    // 2. Hide Content Panes
    document.querySelectorAll('.tab-pane').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });

    // 3. Activate Selection
    document.getElementById(`tab-${tabName}-btn`).classList.add('active');
    const targetPane = document.getElementById(`content-${tabName}`);
    targetPane.style.display = 'block';
    targetPane.classList.add('active');

    // 4. Specific actions per tab
    if (tabName === 'profile') loadProfileIntoForm();
    if (tabName === 'appointments') renderPatientAppointments();
}

// --- PROFILE LOGIC ---
function calculateAge(dob) {
    if (!dob) return "N/A";
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
}

function syncAndRenderProfile() {
    const patients = SharedDB.get('patients');
    let myData = patients.find(p => p.id === PATIENT_ID);

    if (!myData) {
        myData = { id: PATIENT_ID, name: 'Patient', dob: '2000-05-15', gender: 'Female', phone: '09123456789', status: 'Active' };
        patients.push(myData);
        SharedDB.set('patients', patients);
    }

    // Update Header & Sidebar
    document.getElementById('prof-name').innerText = myData.name;
    document.getElementById('footer-name').innerText = myData.name;
    document.getElementById('footer-avatar').innerText = myData.name.charAt(0).toUpperCase();
    document.getElementById('avatar-circle').innerText = myData.name.charAt(0).toUpperCase();
    
    // Update Details
    document.getElementById('prof-age').innerText = calculateAge(myData.dob);
    document.getElementById('prof-gender').innerText = myData.gender;
    document.getElementById('prof-phone').innerText = myData.phone;
}

function loadProfileIntoForm() {
    const patients = SharedDB.get('patients');
    const myData = patients.find(p => p.id === PATIENT_ID);
    if (myData) {
        document.getElementById('edit-name').value = myData.name || '';
        document.getElementById('edit-phone').value = myData.phone || '';
        document.getElementById('edit-dob').value = myData.dob || '';
        document.getElementById('edit-gender').value = myData.gender || 'Male';
        document.getElementById('edit-emergency').value = myData.emergency || '';
    }
}

document.getElementById('profile-update-form').addEventListener('submit', function(e) {
    e.preventDefault();
    let patients = SharedDB.get('patients');
    const index = patients.findIndex(p => p.id === PATIENT_ID);

    if (index !== -1) {
        patients[index].name = document.getElementById('edit-name').value;
        patients[index].phone = document.getElementById('edit-phone').value;
        patients[index].dob = document.getElementById('edit-dob').value;
        patients[index].gender = document.getElementById('edit-gender').value;
        patients[index].emergency = document.getElementById('edit-emergency').value;

        SharedDB.set('patients', patients);
        syncAndRenderProfile();
        alert("Profile updated successfully!");
    }
});

// --- APPOINTMENTS LOGIC ---
document.getElementById('appointment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const patients = SharedDB.get('patients');
    const myData = patients.find(p => p.id === PATIENT_ID);

    const newAppt = {
        id: Date.now(),
        patient: myData.name, 
        doctor: document.getElementById('a-doctor').value,
        date: document.getElementById('a-date').value,
        time: document.getElementById('a-time').value,
        reason: document.getElementById('a-service').value,
        status: 'Scheduled'
    };
    
    // Save Appointment
    let appointments = SharedDB.get('appointments');
    appointments.push(newAppt);
    SharedDB.set('appointments', appointments);

    // --- NEW: Trigger Admin Notification ---
    let notifications = SharedDB.get('notifications') || [];
    notifications.push({
        id: Date.now(),
        message: `New appointment booked by ${myData.name}`,
        patient: myData.name,
        time: new Date().toLocaleTimeString(),
        read: false
    });
    SharedDB.set('notifications', notifications);

    alert("Appointment successfully booked!");
    this.reset();
});

function renderPatientAppointments() {
    const patients = SharedDB.get('patients');
    const myData = patients.find(p => p.id === PATIENT_ID);
    const myAppts = SharedDB.get('appointments').filter(a => a.patient === myData.name);
    
    const container = document.getElementById('patient-appointments-list');
    if (myAppts.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:20px;">No appointments found.</p>';
        return;
    }

    container.innerHTML = myAppts.reverse().map(appt => {
        // Logic to conditionally show the cancel button
        const showCancelButton = appt.status !== 'Completed' && appt.status !== 'Cancelled';
        
        return `
            <div style="display:flex; align-items:center; gap:12px; padding:12px 0; border-bottom:1px solid var(--border);">
                <div class="appt-date">
                    <div class="day">${new Date(appt.date).getDate()}</div>
                    <div class="month">${new Date(appt.date).toLocaleString('default', {month:'short'})}</div>
                </div>
                <div style="flex:1">
                    <div style="font-size:14px; font-weight:600">${appt.reason}</div>
                    <div style="font-size:12px; color:var(--text-muted)">Dr. ${appt.doctor} at ${appt.time}</div>
                </div>
                <span class="badge ${appt.status === 'Completed' ? 'badge-green' : 'badge-blue'}">${appt.status}</span>
                
                ${showCancelButton ? 
                    `<button onclick="cancelAppt(${appt.id})" class="btn btn-sm" style="color:var(--danger);">Cancel</button>` 
                    : ''
                }
            </div>
        `;
    }).join('');
}

// --- Updated cancelAppt in patient-script.js ---
window.cancelAppt = function(id) {
    if (confirm("Cancel this appointment?")) {
        let appts = SharedDB.get('appointments');
        const apptToCancel = appts.find(a => a.id == id); //
        const patients = SharedDB.get('patients');
        const myData = patients.find(p => p.id === PATIENT_ID); //

        if (apptToCancel) {
            // --- NEW: Trigger Admin Notification for Cancellation ---
            let notifications = SharedDB.get('notifications') || [];
            notifications.push({
                id: Date.now(),
                message: `Appointment for ${apptToCancel.reason} was cancelled`,
                patient: myData.name,
                time: new Date().toLocaleTimeString(),
                read: false,
                type: 'cancellation' // Added type for styling if needed
            });
            SharedDB.set('notifications', notifications);
        }

        SharedDB.set('appointments', appts.filter(a => a.id != id)); //[cite: 5]
        renderPatientAppointments(); //[cite: 5]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    syncAndRenderProfile();
    const doctors = SharedDB.get('doctors');
    document.getElementById('a-doctor').innerHTML = doctors.map(d => 
        `<option value="${d.name}">${d.name}</option>`
    ).join('');

document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

});