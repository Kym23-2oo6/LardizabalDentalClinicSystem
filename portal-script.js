const DB = {
    get(key) { return JSON.parse(localStorage.getItem('hms_' + key) || '[]'); },
    set(key, data) { localStorage.setItem('hms_' + key, JSON.stringify(data)); }
};

function showPatientAuth() {
    document.getElementById('portal-main-view').style.display = 'none';
    document.getElementById('patient-auth-view').style.display = 'block';
}

function backToPortal() {
    document.getElementById('portal-main-view').style.display = 'block';
    document.getElementById('patient-auth-view').style.display = 'none';
    document.getElementById('auth-error').style.display = 'none';
}

function toggleAuth(isSignup) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');

    if (isSignup) {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        title.innerText = "Create Account";
        subtitle.innerText = "Join our clinic to manage your dental health.";
    } else {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        title.innerText = "Patient Sign In";
        subtitle.innerText = "Access your dental records and appointments.";
    }
    document.getElementById('auth-error').style.display = 'none';
}

// Ensure handleLogin and handleSignup redirect to the correct dashboard
function handleLogin() {
    const name = document.getElementById('login-name').value.trim();
    const patients = DB.get('patients');
    const user = patients.find(p => p.name.toLowerCase() === name.toLowerCase());

    if (user) {
        localStorage.setItem('current_patient_id', user.id);
        window.location.href = 'patient-dashboard.html';
    } else {
        const err = document.getElementById('auth-error');
        err.innerText = "Account not found. Please sign up first.";
        err.style.display = 'block';
    }
}

function handleSignup() {
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const err = document.getElementById('auth-error');
    const success = document.getElementById('auth-success');
    
    // Reset messages
    err.style.display = 'none';
    success.style.display = 'none';

    if (!name || !phone) {
        err.innerText = "Please fill in all fields.";
        err.style.display = 'block';
        return;
    }

    let patients = DB.get('patients');
    
    // Check if user already exists
    if (patients.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        err.innerText = "An account with this name already exists.";
        err.style.display = 'block';
        return;
    }

    const newId = patients.length > 0 ? Math.max(...patients.map(p => p.id)) + 1 : 1;
    
    const newPatient = {
        id: newId,
        name: name,
        phone: phone,
        dob: '', 
        gender: 'Not Specified',
        status: 'Active',
        history: ''
    };

    patients.push(newPatient);
    DB.set('patients', patients);
    
    // Show success message
    success.innerText = "Account created successfully! Please sign in.";
    success.style.display = 'block';

    // Clear registration fields
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-phone').value = '';

    // Switch to Login view after 2 seconds
    setTimeout(() => {
        toggleAuth(false); // Switch to login form
        document.getElementById('login-name').value = name; // Pre-fill the name for them
        success.style.display = 'none';
    }, 2000);
}