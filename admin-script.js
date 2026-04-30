/**
 * HOSPITAL MANAGEMENT SYSTEM - CORE SCRIPT
 */

// ==========================================
// 1. UTILITIES & CONFIGURATION
// ==========================================

const DB = {
  get(key) { return JSON.parse(localStorage.getItem('hms_' + key) || '[]'); },
  set(key, data) { localStorage.setItem('hms_' + key, JSON.stringify(data)); },
  nextId(key) {
    const items = this.get(key);
    return items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
  }
};

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calcAge(dob) {
  if (!dob) return '—';
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
}

function getStatusBadge(status) {
  const map = {
    'Active': 'badge-green', 'Completed': 'badge-green', 'Paid': 'badge-green',
    'Scheduled': 'badge-blue', 'On Leave': 'badge-yellow', 'Pending': 'badge-yellow',
    'Critical': 'badge-red', 'Cancelled': 'badge-red', 'Overdue': 'badge-red',
    'Inactive': 'badge-gray', 'No Show': 'badge-gray',
    'Consultation': 'badge-gold', 'Follow-up': 'badge-blue',
    'Emergency': 'badge-red', 'Procedure': 'badge-blue',
  };
  return `<span class="badge ${map[status] || 'badge-gray'}">${status}</span>`;
}

// ==========================================
// 2. NAVIGATION & PAGE CONTROL
// ==========================================

let currentPage = 'dashboard';
let editingId = null;

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  const nav = document.querySelector(`[onclick="navigate('${page}')"]`);
  if (nav) nav.classList.add('active');
  document.getElementById('page-' + page).classList.add('active');
  currentPage = page;

  const titles = {
    dashboard: ['Dashboard', 'Overview of hospital operations'],
    patients: ['Patients', 'Manage patient records'],
    doctors: ['Doctors', 'Manage medical staff'],
    appointments: ['Appointments', 'Schedule & track appointments'],
    records: ['Medical Records', 'Clinical notes and diagnoses'],
    billing: ['Billing', 'Manage invoices and payments']
  };
  document.getElementById('page-title').textContent = titles[page][0];
  document.getElementById('page-subtitle').textContent = titles[page][1];

  // Render specific page content
  const renderers = {
    dashboard: renderDashboard,
    patients: renderPatients,
    doctors: renderDoctors,
    appointments: renderAppointments,
    records: renderRecords,
    billing: renderBilling
  };
  if (renderers[page]) renderers[page]();
}

// ==========================================
// 3. MODAL MANAGEMENT (ADD/EDIT/VIEW)
// ==========================================

let currentModal = null;

function openModal(type, id = null) {
  editingId = id;
  document.getElementById('modal-overlay').style.display = 'flex';
  currentModal = type;

  // Hide all modals first
  ['patient','doctor','appointment','record','billing'].forEach(t =>
    document.getElementById('modal-' + t).style.display = 'none'
  );
  document.getElementById('modal-' + type).style.display = 'block';

  // Populate dynamic dropdowns
  if (['appointment', 'record', 'billing'].includes(type)) {
    const patients = DB.get('patients');
    const selectors = { appointment: 'a-patient', record: 'r-patient', billing: 'b-patient' };
    const sel = document.getElementById(selectors[type]);
    sel.innerHTML = '<option value="">Select Patient...</option>' +
      patients.map(p => `<option>${p.name}</option>`).join('');
  }
  
  if (['appointment', 'record'].includes(type)) {
    const doctors = DB.get('doctors');
    const selectors = { appointment: 'a-doctor', record: 'r-doctor' };
    const sel = document.getElementById(selectors[type]);
    sel.innerHTML = '<option value="">Select Doctor...</option>' +
      doctors.map(d => `<option>${d.name}</option>`).join('');
  }

  const today = new Date().toISOString().split('T')[0];

  if (id !== null) {
    // Populate Edit Mode
    const key = type === 'billing' ? 'billing' : type === 'record' ? 'records' : type === 'appointment' ? 'appointments' : type + 's';
    const data = DB.get(key).find(i => i.id === id);

    if (type === 'patient') {
      document.getElementById('patient-modal-title').textContent = 'Edit Patient';
      document.getElementById('p-name').value = data.name;
      document.getElementById('p-dob').value = data.dob;
      document.getElementById('p-gender').value = data.gender;
      document.getElementById('p-blood').value = data.blood;
      document.getElementById('p-phone').value = data.phone;
      document.getElementById('p-address').value = data.address;
      document.getElementById('p-history').value = data.history;
      document.getElementById('p-status').value = data.status;
      document.getElementById('p-emergency').value = data.emergency;
    } else if (type === 'doctor') {
      document.getElementById('doctor-modal-title').textContent = 'Edit Doctor';
      document.getElementById('d-name').value = data.name;
      document.getElementById('d-spec').value = data.spec;
      document.getElementById('d-phone').value = data.phone;
      document.getElementById('d-email').value = data.email;
      document.getElementById('d-license').value = data.license;
      document.getElementById('d-schedule').value = data.schedule;
      document.getElementById('d-status').value = data.status;
    } else if (type === 'appointment') {
      document.getElementById('appt-modal-title').textContent = 'Edit Appointment';
      document.getElementById('a-patient').value = data.patient;
      document.getElementById('a-doctor').value = data.doctor;
      document.getElementById('a-date').value = data.date;
      document.getElementById('a-time').value = data.time;
      document.getElementById('a-reason').value = data.reason;
      document.getElementById('a-status').value = data.status;
      document.getElementById('a-notes').value = data.notes;
    } else if (type === 'record') {
      document.getElementById('record-modal-title').textContent = 'Edit Record';
      document.getElementById('r-patient').value = data.patient;
      document.getElementById('r-doctor').value = data.doctor;
      document.getElementById('r-diagnosis').value = data.diagnosis;
      document.getElementById('r-prescription').value = data.prescription;
      document.getElementById('r-notes').value = data.notes;
      document.getElementById('r-date').value = data.date;
      document.getElementById('r-type').value = data.type;
    } else if (type === 'billing') {
      document.getElementById('billing-modal-title').textContent = 'Edit Bill';
      document.getElementById('b-patient').value = data.patient;
      document.getElementById('b-service').value = data.service;
      document.getElementById('b-amount').value = data.amount;
      document.getElementById('b-date').value = data.date;
      document.getElementById('b-status').value = data.status;
      document.getElementById('b-method').value = data.method;
    }
  } else {
    // Reset for Add Mode
    document.getElementById('patient-modal-title').textContent = 'Add Patient';
    document.getElementById('doctor-modal-title').textContent = 'Add Doctor';
    document.getElementById('appt-modal-title').textContent = 'New Appointment';
    document.getElementById('record-modal-title').textContent = 'Add Medical Record';
    document.getElementById('billing-modal-title').textContent = 'Add Bill';

    ['p-name','p-dob','p-phone','p-address','p-history','p-emergency',
     'd-name','d-phone','d-email','d-license',
     'a-reason','a-notes','r-diagnosis','r-prescription','r-notes','b-service','b-amount'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });

    ['a-date', 'r-date', 'b-date'].forEach(id => { const el = document.getElementById(id); if (el) el.value = today; });
    const atime = document.getElementById('a-time'); if (atime) atime.value = '09:00';
  }

  // Hide error messages
  ['patient','doctor','appt','record','billing'].forEach(t => {
    const el = document.getElementById(t + '-err');
    if (el) el.style.display = 'none';
  });
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  currentModal = null; editingId = null;
}

function closeModalOverlay(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function closeViewModal(e) {
  if (e.target === document.getElementById('modal-view-overlay'))
    document.getElementById('modal-view-overlay').style.display = 'none';
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.style.display = 'block';
}

// ==========================================
// 4. DATA PERSISTENCE (SAVE / DELETE)
// ==========================================

function savePatient() {
  const name = document.getElementById('p-name').value.trim();
  const dob = document.getElementById('p-dob').value;
  const gender = document.getElementById('p-gender').value;
  if (!name || !dob || !gender) return showErr('patient-err', 'Please fill in all required fields.');

  const patients = DB.get('patients');
  const record = {
    id: editingId || DB.nextId('patients'),
    name, dob, gender,
    blood: document.getElementById('p-blood').value,
    phone: document.getElementById('p-phone').value,
    address: document.getElementById('p-address').value,
    history: document.getElementById('p-history').value,
    status: document.getElementById('p-status').value,
    emergency: document.getElementById('p-emergency').value,
  };

  if (editingId) {
    const idx = patients.findIndex(p => p.id === editingId);
    patients[idx] = record;
  } else {
    patients.push(record);
  }
  DB.set('patients', patients);
  closeModal();
  renderPatients();
}

function saveDoctor() {
  const name = document.getElementById('d-name').value.trim();
  const spec = document.getElementById('d-spec').value;
  if (!name || !spec) return showErr('doctor-err', 'Please fill in all required fields.');

  const doctors = DB.get('doctors');
  const record = {
    id: editingId || DB.nextId('doctors'),
    name, spec,
    phone: document.getElementById('d-phone').value,
    email: document.getElementById('d-email').value,
    license: document.getElementById('d-license').value,
    schedule: document.getElementById('d-schedule').value,
    status: document.getElementById('d-status').value,
  };

  if (editingId) {
    const idx = doctors.findIndex(d => d.id === editingId);
    doctors[idx] = record;
  } else {
    doctors.push(record);
  }
  DB.set('doctors', doctors);
  closeModal();
  renderDoctors();
}

function saveAppointment() {
  const patient = document.getElementById('a-patient').value;
  const doctor = document.getElementById('a-doctor').value;
  const date = document.getElementById('a-date').value;
  if (!patient || !doctor || !date) return showErr('appt-err', 'Please fill in all required fields.');

  const appointments = DB.get('appointments');
  const record = {
    id: editingId || DB.nextId('appointments'),
    patient, doctor, date,
    time: document.getElementById('a-time').value,
    reason: document.getElementById('a-reason').value,
    status: document.getElementById('a-status').value,
    notes: document.getElementById('a-notes').value,
  };

  if (editingId) {
    const idx = appointments.findIndex(a => a.id === editingId);
    appointments[idx] = record;
  } else {
    appointments.push(record);
  }
  DB.set('appointments', appointments);
  closeModal();
  renderAppointments();
}

function saveRecord() {
  const patient = document.getElementById('r-patient').value;
  const doctor = document.getElementById('r-doctor').value;
  const diagnosis = document.getElementById('r-diagnosis').value.trim();
  if (!patient || !doctor || !diagnosis) return showErr('record-err', 'Please fill in all required fields.');

  const records = DB.get('records');
  const record = {
    id: editingId || DB.nextId('records'),
    patient, doctor, diagnosis,
    prescription: document.getElementById('r-prescription').value,
    notes: document.getElementById('r-notes').value,
    date: document.getElementById('r-date').value,
    type: document.getElementById('r-type').value,
  };

  if (editingId) {
    const idx = records.findIndex(r => r.id === editingId);
    records[idx] = record;
  } else {
    records.push(record);
  }
  DB.set('records', records);
  closeModal();
  renderRecords();
}

function saveBilling() {
  const patient = document.getElementById('b-patient').value;
  const service = document.getElementById('b-service').value.trim();
  const amount = document.getElementById('b-amount').value;
  if (!patient || !service || !amount) return showErr('billing-err', 'Please fill in all required fields.');

  const billing = DB.get('billing');
  const record = {
    id: editingId || DB.nextId('billing'),
    patient, service,
    amount: parseFloat(amount),
    date: document.getElementById('b-date').value,
    status: document.getElementById('b-status').value,
    method: document.getElementById('b-method').value,
  };

  if (editingId) {
    const idx = billing.findIndex(b => b.id === editingId);
    billing[idx] = record;
  } else {
    billing.push(record);
  }
  DB.set('billing', billing);
  closeModal();
  renderBilling();
}

function deleteItem(type, id) {
  if (!confirm('Are you sure you want to delete this record?')) return;
  const key = type === 'billing' ? 'billing' : type === 'record' ? 'records' : type + 's';
  const data = DB.get(key).filter(i => i.id !== id);
  DB.set(key, data);
  
  // Refresh current view
  if (type === 'patient') renderPatients();
  if (type === 'doctor') renderDoctors();
  if (type === 'appointment') renderAppointments();
  if (type === 'record') renderRecords();
  if (type === 'billing') renderBilling();
  if (currentPage === 'dashboard') renderDashboard();
}

// ==========================================
// 5. NOTIFICATION SYSTEM
// ==========================================

function checkNotifications() {
  const notifications = DB.get('notifications') || [];
  const unread = notifications.filter(n => !n.read);
  const countEl = document.getElementById('notification-count');
  const listEl = document.getElementById('notification-list');

  if (unread.length > 0) {
    countEl.innerText = unread.length;
    countEl.style.display = 'block';
  } else {
    countEl.style.display = 'none';
  }

  if (notifications.length === 0) {
    listEl.innerHTML = '<div style="padding:15px; text-align:center; color:var(--text-muted); font-size:13px;">No new notifications</div>';
  } else {
    listEl.innerHTML = notifications.reverse().map(n => {
      const bgColor = n.type === 'cancellation' ? '#fff1f2' : (n.read ? 'transparent' : '#f0f9ff');
      const iconColor = n.type === 'cancellation' ? 'var(--danger)' : 'var(--primary)';
      
      return `
        <div style="padding: 12px 15px; border-bottom: 1px solid var(--border); font-size: 13px; background: ${bgColor}">
          <div style="display: flex; gap: 8px; align-items: start;">
            <i class="fas ${n.type === 'cancellation' ? 'fa-times-circle' : 'fa-calendar-plus'}" style="margin-top: 3px; color: ${iconColor}"></i>
            <div style="flex: 1;">
              <strong>${n.patient}</strong>
              <div style="color: var(--text-muted); font-size: 11px;">${n.message}</div>
              <div style="color: var(--text-muted); font-size: 10px; margin-top: 4px;">${n.time}</div>
            </div>
          </div>
        </div>`;
    }).join('');
  }
}

function toggleNotifications() {
  const dropdown = document.getElementById('notification-dropdown');
  const isVisible = dropdown.style.display === 'block';
  dropdown.style.display = isVisible ? 'none' : 'block';
  
  if (!isVisible) {
    let notifications = DB.get('notifications');
    notifications.forEach(n => n.read = true);
    DB.set('notifications', notifications);
    checkNotifications();
  }
}

function clearNotifications(e) {
  e.stopPropagation();
  DB.set('notifications', []);
  checkNotifications();
}

// ==========================================
// 6. RENDER FUNCTIONS (UI GENERATION)
// ==========================================

function renderPatients() {
  const q = document.getElementById('patient-search').value.toLowerCase();
  const f = document.getElementById('patient-filter').value;
  let patients = DB.get('patients').filter(p =>
    (!q || p.name.toLowerCase().includes(q) || p.phone.includes(q)) &&
    (!f || p.blood === f)
  );
  const tbody = document.getElementById('patients-tbody');
  if (patients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="icon"><span class="icon"><i class="fas fa-user-injured"></i></span></div><p>No patients found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = patients.map(p => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px">P-${String(p.id).padStart(3,'0')}</td>
      <td><strong>${p.name}</strong></td>
      <td>${calcAge(p.dob)}</td>
      <td>${p.gender}</td>
      <td><span class="badge badge-blue">${p.blood || '—'}</span></td>
      <td>${p.phone}</td>
      <td>${getStatusBadge(p.status)}</td>
      <td class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="viewPatient(${p.id})">View</button>
        <button class="btn btn-ghost btn-sm" onclick="openModal('patient', ${p.id})">Edit</button>
        <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteItem('patient', ${p.id})">Del</button>
      </td>
    </tr>`).join('');
}

function viewPatient(id) {
  const p = DB.get('patients').find(x => x.id === id);
  const records = DB.get('records').filter(r => r.patient === p.name);
  const billing = DB.get('billing').filter(b => b.patient === p.name);
  document.getElementById('view-modal-title').textContent = p.name;
  document.getElementById('view-modal-body').innerHTML = `
    <div class="detail-grid" style="margin-bottom:16px">
      <div class="detail-item"><div class="lbl">Date of Birth</div><div class="val">${formatDate(p.dob)} (Age ${calcAge(p.dob)})</div></div>
      <div class="detail-item"><div class="lbl">Gender</div><div class="val">${p.gender}</div></div>
      <div class="detail-item"><div class="lbl">Blood Type</div><div class="val">${p.blood || '—'}</div></div>
      <div class="detail-item"><div class="lbl">Phone</div><div class="val">${p.phone}</div></div>
      <div class="detail-item"><div class="lbl">Status</div><div class="val">${getStatusBadge(p.status)}</div></div>
      <div class="detail-item"><div class="lbl">Emergency Contact</div><div class="val">${p.emergency || '—'}</div></div>
      <div class="detail-item" style="grid-column:1/-1"><div class="lbl">Address</div><div class="val">${p.address || '—'}</div></div>
      <div class="detail-item" style="grid-column:1/-1"><div class="lbl">Medical History / Allergies</div><div class="val">${p.history || 'None'}</div></div>
    </div>
    <div style="margin-bottom:12px"><strong style="font-size:13px">Medical Records (${records.length})</strong>
      ${records.length ? records.map(r => `<div style="margin-top:8px;padding:10px;background:var(--bg);border-radius:8px;font-size:13px"><strong>${r.diagnosis}</strong><br><span style="color:var(--text-muted)">${r.doctor} · ${formatDate(r.date)}</span><br>${r.prescription}</div>`).join('') : '<p style="font-size:13px;color:var(--text-muted);margin-top:6px">No records</p>'}
    </div>
    <div><strong style="font-size:13px">Billing (${billing.length})</strong>
      ${billing.length ? billing.map(b => `<div style="margin-top:8px;padding:10px;background:var(--bg);border-radius:8px;font-size:13px;display:flex;justify-content:space-between"><span>${b.service}</span><span><strong>₱${b.amount.toLocaleString()}</strong> ${getStatusBadge(b.status)}</span></div>`).join('') : '<p style="font-size:13px;color:var(--text-muted);margin-top:6px">No billing</p>'}
    </div>`;
  document.getElementById('modal-view-overlay').style.display = 'flex';
}

function renderDoctors() {
  const q = document.getElementById('doctor-search').value.toLowerCase();
  const f = document.getElementById('doctor-filter').value;
  let doctors = DB.get('doctors').filter(d =>
    (!q || d.name.toLowerCase().includes(q) || d.spec.toLowerCase().includes(q)) &&
    (!f || d.spec === f)
  );
  const tbody = document.getElementById('doctors-tbody');
  if (doctors.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon"><span class="icon"><i class="fas fa-user-md"></i></span></div><p>No doctors found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = doctors.map(d => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px">D-${String(d.id).padStart(3,'0')}</td>
      <td><strong>${d.name}</strong><br><span style="font-size:12px;color:var(--text-muted)">${d.license || ''}</span></td>
      <td><span class="badge badge-gold">${d.spec}</span></td>
      <td>${d.phone}</td>
      <td style="font-size:13px">${d.schedule}</td>
      <td>${getStatusBadge(d.status)}</td>
      <td class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="openModal('doctor', ${d.id})">Edit</button>
        <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteItem('doctor', ${d.id})">Del</button>
      </td>
    </tr>`).join('');
}

function renderAppointments() {
  const q = document.getElementById('appt-search').value.toLowerCase();
  const f = document.getElementById('appt-filter').value;
  let appts = DB.get('appointments').filter(a =>
    (!q || a.patient.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q)) &&
    (!f || a.status === f)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const tbody = document.getElementById('appointments-tbody');
  if (appts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon"><span class="icon"><i class="fas fa-calendar"></i></span></div><p>No appointments found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = appts.map(a => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px">A-${String(a.id).padStart(3,'0')}</td>
      <td><strong>${a.patient}</strong></td>
      <td>${a.doctor}</td>
      <td>${formatDate(a.date)}<br><span style="font-size:12px;color:var(--text-muted)">${a.time}</span></td>
      <td style="font-size:13px">${a.reason}</td>
      <td>${getStatusBadge(a.status)}</td>
      <td class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="openModal('appointment', ${a.id})">Edit</button>
        <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteItem('appointment', ${a.id})">Del</button>
      </td>
    </tr>`).join('');
}

function renderRecords() {
  const q = document.getElementById('record-search').value.toLowerCase();
  let records = DB.get('records').filter(r =>
    !q || r.patient.toLowerCase().includes(q) || r.diagnosis.toLowerCase().includes(q) || r.doctor.toLowerCase().includes(q)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const tbody = document.getElementById('records-tbody');
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon"><span class="icon"><i class="fas fa-clipboard"></i></span></div><p>No records found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = records.map(r => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px">R-${String(r.id).padStart(3,'0')}</td>
      <td><strong>${r.patient}</strong></td>
      <td>${r.doctor}</td>
      <td>${r.diagnosis}<br><span class="badge badge-gray" style="margin-top:3px;font-size:10px">${r.type}</span></td>
      <td style="font-size:13px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.prescription || '—'}</td>
      <td>${formatDate(r.date)}</td>
      <td class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="openModal('record', ${r.id})">Edit</button>
        <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteItem('record', ${r.id})">Del</button>
      </td>
    </tr>`).join('');
}

function renderBilling() {
  const q = document.getElementById('billing-search').value.toLowerCase();
  const f = document.getElementById('billing-filter').value;
  let bills = DB.get('billing').filter(b =>
    (!q || b.patient.toLowerCase().includes(q) || b.service.toLowerCase().includes(q)) &&
    (!f || b.status === f)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const tbody = document.getElementById('billing-tbody');
  if (bills.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="icon"><span class="icon"><i class="fas fa-file-invoice-dollar"></i></span></div><p>No bills found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = bills.map(b => `
    <tr>
      <td style="color:var(--text-muted);font-size:12px">B-${String(b.id).padStart(3,'0')}</td>
      <td><strong>${b.patient}</strong></td>
      <td style="font-size:13px">${b.service}</td>
      <td><strong>₱${b.amount.toLocaleString(undefined,{minimumFractionDigits:2})}</strong><br><span style="font-size:11px;color:var(--text-muted)">${b.method}</span></td>
      <td>${formatDate(b.date)}</td>
      <td>${getStatusBadge(b.status)}</td>
      <td class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="openModal('billing', ${b.id})">Edit</button>
        <button class="btn btn-sm" style="background:#fee2e2;color:#991b1b;border:none" onclick="deleteItem('billing', ${b.id})">Del</button>
      </td>
    </tr>`).join('');
}

function renderDashboard() {
  const patients = DB.get('patients');
  const doctors = DB.get('doctors');
  const appointments = DB.get('appointments');
  const billing = DB.get('billing');

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => 
    a.date === today && !['Completed', 'Cancelled', 'No Show'].includes(a.status)
  ).length;
  const totalRevenue = billing.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0);

  document.getElementById('stats-grid').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:#e3f4ff;font-size:22px"><span class="icon"><i class="fas fa-user-injured"></i></span></div>
      <div class="stat-value">${patients.length}</div>
      <div class="stat-label">Total Patients</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#e3f4ff;font-size:22px"><span class="icon"><i class="fas fa-user-md"></i></span></div>
      <div class="stat-value">${doctors.filter(d => d.status === 'Active').length}</div>
      <div class="stat-label">Active Doctors</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#e3f4ff;font-size:22px"><span class="icon"><i class="fas fa-calendar"></i></span></div>
      <div class="stat-value">${todayAppts}</div>
      <div class="stat-label">Today's Appointments</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:#e3f4ff;font-size:22px"><span class="icon"><i class="fas fa-file-invoice-dollar"></i></span></div>
      <div class="stat-value">₱${totalRevenue.toLocaleString()}</div>
      <div class="stat-label">Total Revenue</div>
    </div>`;

  // Recent appointments list
  const recentAppts = appointments.slice(-5).reverse();
  document.getElementById('dash-appointments').innerHTML = recentAppts.length
    ? recentAppts.map(a => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div class="appt-date">
          <div class="day">${new Date(a.date + 'T00:00:00').getDate()}</div>
          <div class="month">${new Date(a.date + 'T00:00:00').toLocaleString('default',{month:'short'})}</div>
        </div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:500">${a.patient}</div>
          <div style="font-size:12px;color:var(--text-muted)">${a.doctor} · ${a.time}</div>
        </div>
        ${getStatusBadge(a.status)}
      </div>`).join('')
    : '<div class="empty-state"><p>No appointments yet</p></div>';

  // Recent patients list
  const recentPatients = patients.slice(-5).reverse();
  document.getElementById('dash-patients').innerHTML = recentPatients.length
    ? recentPatients.map(p => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
        <div style="width:38px;height:38px;border-radius:50%;background:var(--primary);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:600;flex-shrink:0">
          ${p.name.split(' ').map(w=>w[0]).slice(0,2).join('')}
        </div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:500">${p.name}</div>
          <div style="font-size:12px;color:var(--text-muted)">${p.gender} · ${calcAge(p.dob)} yrs · ${p.blood || 'N/A'}</div>
        </div>
        ${getStatusBadge(p.status)}
      </div>`).join('')
    : '<div class="empty-state"><p>No patients yet</p></div>';
}

// ==========================================
// 7. SEED DATA (INITIALIZATION)
// ==========================================

function seedData() {
  if (DB.get('patients').length > 0) return;

  DB.set('patients', [
    { id: 1, name: 'Vets Tres', dob: '2006-12-30', gender: 'Male', blood: '--', phone: '09090909090', address: 'Taguig City, Metro Manila', history: 'Hypertension, Penicillin allergy', status: 'Active', emergency: '09171234568' },
    { id: 2, name: 'Jun Jez', dob: '2006-06-21', gender: 'Male', blood: '--', phone: '09090909090', address: 'Taguig City, Metro Manila', history: 'Type 2 Diabetes', status: 'Critical', emergency: 'Liberty' },
    { id: 3, name: 'Sao', dob: '2006-02-27', gender: 'Male', blood: '--', phone: '09090909090', address: 'Taguig City, Metro Manila', history: 'Ngek', status: 'Active', emergency: '' },
  ]);

  DB.set('doctors', [
    { id: 1, name: 'Dr. John Michael', spec: 'Cardiology', phone: '09171112222', email: 'lreyes@hospital.com', license: 'PRC-12345', schedule: 'Mon-Fri (Morning)', status: 'Active' },
    { id: 2, name: 'Dr. Joshua', spec: 'General Medicine', phone: '09282223333', email: 'rsantos@hospital.com', license: 'PRC-23456', schedule: 'Mon-Fri (Afternoon)', status: 'Active' },
    { id: 3, name: 'Dr. Kym Brian', spec: 'Pediatrics', phone: '09453334444', email: 'cvillanueva@hospital.com', license: 'PRC-34567', schedule: 'Tue-Sat', status: 'Active' },
  ]);

  const today = new Date().toISOString().split('T')[0];
  DB.set('appointments', [
    { id: 1, patient: 'Steven Tres', doctor: 'Dr. John Michael', date: today, time: '09:00', reason: 'Routine checkup', status: 'Scheduled', notes: '' },
    { id: 2, patient: 'Jez Jun', doctor: 'Dr. Joshua', date: today, time: '10:30', reason: 'Fever and cough', status: 'Completed', notes: 'Prescribed Amoxicillin' },
  ]);

  DB.set('records', [
    { id: 1, patient: 'Steven Tres', doctor: 'Dr. John Michael', diagnosis: 'Hypertension Stage 1', prescription: 'Amlodipine 5mg daily', notes: 'Monitor BP weekly', date: today, type: 'Consultation' },
    { id: 2, patient: 'Jez Jun', doctor: 'Dr. Joshua', diagnosis: 'Acute Upper Respiratory Infection', prescription: 'Amoxicillin 500mg TID x 7 days, Paracetamol PRN', notes: 'Rest and hydration', date: today, type: 'Consultation' },
  ]);

  DB.set('billing', [
    { id: 1, patient: 'Steven Tres', service: 'Consultation – Cardiology', amount: 1500, date: today, status: 'Paid', method: 'Cash' },
    { id: 3, patient: 'Jez Jun', service: 'Diabetes Monitoring Package', amount: 2200, date: today, status: 'Pending', method: 'PhilHealth' },
  ]);
}

// ==========================================
// 8. INITIALIZATION & LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  const dateStr = new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const dateEl = document.getElementById('current-date');
  if (dateEl) dateEl.textContent = dateStr;

  seedData();
  renderDashboard();
  checkNotifications();
  
  // Polling for notifications
  setInterval(checkNotifications, 5000);
});