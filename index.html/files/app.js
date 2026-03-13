// ═══════════════════════════════════════════════════════════════
// ALPHA PACK CAPITAL MAX — v6.0 · Main Application
// Router, State Management, Core Logic
// ═══════════════════════════════════════════════════════════════

import { SUPABASE_URL, SUPABASE_ANON_KEY, BIZ, P, calcLoan, getPackage, formatDate } from './modules/config.js';
import { Auth, Loans, KYC, Ads, Admin } from './modules/db.js';
import {
  showToast,
  showLoader,
  hideLoader,
  showModal,
  validateForm,
  getFormValues,
  setFormValues,
  clearFieldErrors,
  formatCurrency,
  formatPhoneForWhatsApp,
  formatDate as fmtDate,
  formatTimeAgo,
  getBadgeHTML
} from './modules/ui.js';

// ────────────────────────────────────────────────────────────
// APPLICATION STATE
// ────────────────────────────────────────────────────────────

window.AppState = {
  user: null,
  profile: null,
  userRole: 'user',
  isAuthenticated: false,
  currentPage: 'home'
};

// ────────────────────────────────────────────────────────────
// INITIALIZE APP
// ────────────────────────────────────────────────────────────

window.initApp = async () => {
  console.log('Initializing Alpha Pack Capital Max...');

  try {
    // Check session
    const { session } = await Auth.getSession();
    
    if (session?.user) {
      AppState.user = session.user;
      AppState.isAuthenticated = true;

      // Get profile
      const profile = await Auth.getProfile(session.user.id);
      AppState.profile = profile;
      AppState.userRole = profile.role;

      console.log('✓ User authenticated:', session.user.email);
    }

    // Initialize page based on current URL
    initializePage();
  } catch (error) {
    console.error('Init error:', error);
  }
};

// ────────────────────────────────────────────────────────────
// PAGE INITIALIZATION
// ────────────────────────────────────────────────────────────

const initializePage = () => {
  const path = window.location.pathname;

  // Determine current page
  if (path.includes('register')) {
    if (AppState.isAuthenticated) window.location.href = 'dashboard.html';
    else initRegisterPage();
  } else if (path.includes('login') && !path.includes('admin')) {
    if (AppState.isAuthenticated) window.location.href = 'dashboard.html';
    else initLoginPage();
  } else if (path.includes('dashboard')) {
    if (!AppState.isAuthenticated) window.location.href = 'login.html';
    else initStudentDashboard();
  } else if (path.includes('admin/login')) {
    if (AppState.isAuthenticated && AppState.userRole === 'admin') window.location.href = 'dashboard.html';
    else initAdminLoginPage();
  } else if (path.includes('admin/dashboard')) {
    if (!AppState.isAuthenticated || AppState.userRole !== 'admin') window.location.href = 'login.html';
    else initAdminDashboard();
  } else if (path.includes('admin')) {
    if (!AppState.isAuthenticated || AppState.userRole !== 'admin') window.location.href = 'login.html';
    else initAdminPage();
  } else if (path.includes('verify-email')) {
    initVerifyEmailPage();
  }
};

// ────────────────────────────────────────────────────────────
// REGISTRATION PAGE
// ────────────────────────────────────────────────────────────

const initRegisterPage = () => {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const formData = getFormValues('#registerForm');

    // Validation
    const errors = validateForm('#registerForm', {
      fullName: { required: true, label: 'Full Name', minLength: 2 },
      email: { required: true, label: 'Email', email: true },
      phone: { required: true, label: 'Phone', phone: true },
      institution: { required: true, label: 'Institution' },
      program: { required: true, label: 'Program' },
      yearOfStudy: { required: true, label: 'Year of Study' },
      studentIdNo: { required: true, label: 'Student ID Number' },
      password: { required: true, label: 'Password', minLength: 8 },
      confirmPassword: { required: true, label: 'Confirm Password' }
    });

    if (errors.length > 0) {
      errors.forEach(error => {
        const el = document.querySelector(`[name="${error.field}"]`);
        if (el) {
          el.classList.add('error');
          const msg = document.createElement('div');
          msg.className = 'form-error';
          msg.textContent = error.message;
          el.parentNode.appendChild(msg);
        }
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'danger');
      return;
    }

    showLoader('Creating your account...');

    try {
      await Auth.register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        institution: formData.institution,
        program: formData.program,
        yearOfStudy: parseInt(formData.yearOfStudy),
        studentIdNo: formData.studentIdNo
      });

      hideLoader();
      showToast('✓ Account created! Check your email to verify.', 'success');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } catch (error) {
      hideLoader();
      showToast('Error: ' + error.message, 'danger');
    }
  });
};

// ────────────────────────────────────────────────────────────
// LOGIN PAGE
// ────────────────────────────────────────────────────────────

const initLoginPage = () => {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const formData = getFormValues('#loginForm');

    if (!formData.email || !formData.password) {
      showToast('Email and password required', 'danger');
      return;
    }

    showLoader('Logging in...');

    try {
      await Auth.login(formData.email, formData.password);
      hideLoader();
      showToast('✓ Welcome back!', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      hideLoader();
      showToast('Error: ' + error.message, 'danger');
    }
  });
};

// ────────────────────────────────────────────────────────────
// STUDENT DASHBOARD
// ────────────────────────────────────────────────────────────

const initStudentDashboard = () => {
  console.log('Initializing student dashboard...');

  // Load student data
  loadStudentProfile();
  loadStudentLoans();
  loadKYCStatus();

  // Setup KYC upload
  setupKYCUpload();

  // Setup loan application
  setupLoanApplication();

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await Auth.logout();
      window.location.href = 'index.html';
    });
  }
};

const loadStudentProfile = async () => {
  try {
    const profile = await Auth.getProfile(AppState.user.id);
    
    const profileEl = document.getElementById('studentProfile');
    if (profileEl) {
      profileEl.innerHTML = `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Your Profile</h3>
          </div>
          <div class="card-body">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <p style="color: #4b5563; font-size: 0.875rem; margin-bottom: 4px;">Full Name</p>
                <p style="font-weight: 600;">${profile.full_name || '—'}</p>
              </div>
              <div>
                <p style="color: #4b5563; font-size: 0.875rem; margin-bottom: 4px;">Email</p>
                <p style="font-weight: 600;">${profile.email}</p>
              </div>
              <div>
                <p style="color: #4b5563; font-size: 0.875rem; margin-bottom: 4px;">Institution</p>
                <p style="font-weight: 600;">${profile.institution || '—'}</p>
              </div>
              <div>
                <p style="color: #4b5563; font-size: 0.875rem; margin-bottom: 4px;">KYC Status</p>
                <p>${getBadgeHTML(profile.kyc_status)}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
};

const loadStudentLoans = async () => {
  try {
    const loans = await Loans.forUser(AppState.user.id);
    
    const loansEl = document.getElementById('studentLoans');
    if (loansEl) {
      if (loans.length === 0) {
        loansEl.innerHTML = `
          <div class="card" style="text-align: center; padding: 40px;">
            <p style="color: #4b5563; margin-bottom: 16px;">No loans yet. Apply for your first loan!</p>
            <button class="btn btn-primary" onclick="document.getElementById('loanModal').style.display='flex';">Apply Now</button>
          </div>
        `;
      } else {
        loansEl.innerHTML = `
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Package</th>
                  <th>Amount</th>
                  <th>Total Due</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                ${loans.map(loan => `
                  <tr>
                    <td>${loan.package_label}</td>
                    <td>${P(loan.principal)}</td>
                    <td>${P(loan.total_repayable)}</td>
                    <td>${getBadgeHTML(loan.status)}</td>
                    <td>${fmtDate(loan.due_date)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading loans:', error);
  }
};

const loadKYCStatus = async () => {
  try {
    const profile = await Auth.getProfile(AppState.user.id);
    const kycEl = document.getElementById('kycStatus');
    
    if (kycEl) {
      if (profile.kyc_status === 'not_started') {
        kycEl.innerHTML = `
          <div class="alert alert-info">
            <p><strong>KYC Not Started</strong></p>
            <p style="margin-bottom: 0;">Please upload your Student ID to get started with loan applications.</p>
          </div>
        `;
      } else if (profile.kyc_status === 'pending') {
        kycEl.innerHTML = `
          <div class="alert alert-warning">
            <p><strong>KYC Pending Review</strong></p>
            <p style="margin-bottom: 0;">Your Student ID is under review. We'll notify you within 1-2 business days.</p>
          </div>
        `;
      } else if (profile.kyc_status === 'approved') {
        kycEl.innerHTML = `
          <div class="alert alert-success">
            <p><strong>KYC Verified ✓</strong></p>
            <p style="margin-bottom: 0;">Your Student ID has been verified. You can now apply for loans.</p>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading KYC status:', error);
  }
};

const setupKYCUpload = () => {
  const form = document.getElementById('kycForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const frontFile = document.querySelector('input[name="front"]').files[0];
    const backFile = document.querySelector('input[name="back"]').files[0];

    if (!frontFile || !backFile) {
      showToast('Please select both front and back ID photos', 'danger');
      return;
    }

    showLoader('Uploading Student ID...');

    try {
      await KYC.submit(AppState.user.id, frontFile, backFile);
      hideLoader();
      showToast('✓ Student ID submitted for review!', 'success');
      form.reset();
      loadKYCStatus();
    } catch (error) {
      hideLoader();
      showToast('Error: ' + error.message, 'danger');
    }
  });
};

const setupLoanApplication = () => {
  const form = document.getElementById('loanForm');
  if (!form) return;

  const packageSelect = form.querySelector('[name="package"]');
  const amountInput = form.querySelector('[name="amount"]');

  // Update min/max based on package
  const updatePackageLimits = () => {
    const pkg = getPackage(packageSelect.value);
    if (pkg) {
      amountInput.min = pkg.min;
      amountInput.max = pkg.max;
    }
  };

  packageSelect.addEventListener('change', updatePackageLimits);
  updatePackageLimits();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors();

    const formData = getFormValues('#loanForm');

    // Validation
    const errors = validateForm('#loanForm', {
      package: { required: true, label: 'Package' },
      amount: { required: true, label: 'Amount' },
      repaymentDays: { required: true, label: 'Repayment Period' },
      purpose: { required: true, label: 'Purpose', minLength: 10 },
      phone: { required: true, label: 'Contact Phone', phone: true }
    });

    if (errors.length > 0) {
      errors.forEach(err => {
        const el = form.querySelector(`[name="${err.field}"]`);
        if (el) {
          el.classList.add('error');
          const msg = document.createElement('div');
          msg.className = 'form-error';
          msg.textContent = err.message;
          el.parentNode.appendChild(msg);
        }
      });
      return;
    }

    const pkg = getPackage(formData.package);
    const calculation = calcLoan(parseFloat(formData.amount), parseInt(formData.repaymentDays));

    showLoader('Submitting application...');

    try {
      await Loans.submit({
        userId: AppState.user.id,
        packageId: formData.package,
        packageLabel: pkg.label,
        principal: calculation.principal,
        interest: calculation.interest,
        total: calculation.total,
        repaymentDays: calculation.repaymentDays,
        purpose: formData.purpose,
        phone: formData.phone
      });

      hideLoader();
      showToast('✓ Loan application submitted!', 'success');
      form.reset();
      setTimeout(() => loadStudentLoans(), 1000);
    } catch (error) {
      hideLoader();
      showToast('Error: ' + error.message, 'danger');
    }
  });
};

// ────────────────────────────────────────────────────────────
// ADMIN DASHBOARD
// ────────────────────────────────────────────────────────────

const initAdminDashboard = async () => {
  console.log('Initializing admin dashboard...');

  try {
    const stats = await Loans.stats();
    const users = await Admin.getAllUsers();

    // Update KPIs
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalLoans').textContent = stats.total;
    document.getElementById('pendingLoans').textContent = stats.pending;
    document.getElementById('approvedLoans').textContent = stats.approved;

    // Recent loans
    const loans = await Loans.all();
    const recentLoansEl = document.getElementById('recentLoans');
    if (recentLoansEl) {
      recentLoansEl.innerHTML = loans.slice(0, 5).map(loan => `
        <div class="card">
          <p style="color: #4b5563; font-size: 0.875rem; margin-bottom: 4px;">${loan.profiles?.full_name || 'Unknown'}</p>
          <p style="font-weight: 600; margin-bottom: 8px;">${P(loan.principal)}</p>
          <p style="display: flex; justify-content: space-between; align-items: center;">
            <span>${fmtDate(loan.created_at)}</span>
            ${getBadgeHTML(loan.status)}
          </p>
        </div>
      `).join('');
    }

    // Logout
    const logoutBtn = document.getElementById('adminLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await Auth.logout();
        window.location.href = 'index.html';
      });
    }
  } catch (error) {
    console.error('Admin dashboard error:', error);
    showToast('Error loading dashboard', 'danger');
  }
};

// ────────────────────────────────────────────────────────────
// ADMIN LOGIN
// ────────────────────────────────────────────────────────────

const initAdminLoginPage = () => {
  const form = document.getElementById('adminLoginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = getFormValues('#adminLoginForm');

    showLoader('Authenticating...');

    try {
      await Auth.login(formData.email, formData.password);

      // Check if admin
      const { role } = await Auth.getUserRole(AppState.user.id);
      if (role !== 'admin') {
        throw new Error('Admin access required');
      }

      hideLoader();
      showToast('✓ Welcome Admin!', 'success');
      setTimeout(() => {
        window.location.href = 'admin/dashboard.html';
      }, 1000);
    } catch (error) {
      hideLoader();
      showToast('Error: ' + error.message, 'danger');
    }
  });
};

// ────────────────────────────────────────────────────────────
// VERIFY EMAIL PAGE
// ────────────────────────────────────────────────────────────

const initVerifyEmailPage = async () => {
  try {
    const hash = window.location.hash.slice(1);

    if (!hash) {
      showToast('No verification token found', 'danger');
      return;
    }

    // This would be handled by Supabase auth
    console.log('Email verification initiated...');
  } catch (error) {
    console.error('Verification error:', error);
  }
};

// ────────────────────────────────────────────────────────────
// GENERIC ADMIN PAGE
// ────────────────────────────────────────────────────────────

const initAdminPage = async () => {
  const path = window.location.pathname;

  if (path.includes('kyc-queue')) {
    await initKYCQueue();
  } else if (path.includes('loan-queue')) {
    await initLoanQueue();
  } else if (path.includes('analytics')) {
    await initAnalytics();
  } else if (path.includes('ads')) {
    await initAds();
  } else if (path.includes('students')) {
    await initStudents();
  } else if (path.includes('settings')) {
    await initSettings();
  }
};

const initKYCQueue = async () => {
  try {
    const pending = await KYC.getPending();

    const queueEl = document.getElementById('kycQueue');
    if (queueEl) {
      queueEl.innerHTML = pending.map(student => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: start; gap: 16px;">
            <div style="flex: 1;">
              <p style="font-weight: 600; margin-bottom: 4px;">${student.full_name}</p>
              <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 8px;">${student.email}</p>
              <p style="font-size: 0.875rem; color: #4b5563;">ID: ${student.student_id_no}</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-success btn-sm" onclick="approveKYC('${student.id}')">Approve</button>
              <button class="btn btn-danger btn-sm" onclick="rejectKYC('${student.id}')">Reject</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    showToast('Error loading KYC queue: ' + error.message, 'danger');
  }
};

const initLoanQueue = async () => {
  try {
    const loans = await Loans.all('pending');

    const queueEl = document.getElementById('loanQueue');
    if (queueEl) {
      queueEl.innerHTML = loans.map(loan => `
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: start; gap: 16px;">
            <div style="flex: 1;">
              <p style="font-weight: 600; margin-bottom: 4px;">${loan.profiles?.full_name}</p>
              <p style="font-size: 0.875rem; color: #4b5563; margin-bottom: 8px;">${P(loan.principal)} - ${loan.package_label}</p>
              <p style="font-size: 0.75rem; color: #4b5563;">Purpose: ${loan.purpose}</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-success btn-sm" onclick="approveLoan('${loan.id}')">Approve</button>
              <button class="btn btn-danger btn-sm" onclick="declineLoan('${loan.id}')">Decline</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    showToast('Error loading loan queue: ' + error.message, 'danger');
  }
};

// Global functions for admin actions
window.approveKYC = async (userId) => {
  try {
    showLoader('Approving KYC...');
    await KYC.decision(userId, 'approved');
    hideLoader();
    showToast('✓ KYC approved', 'success');
    initKYCQueue();
  } catch (error) {
    hideLoader();
    showToast('Error: ' + error.message, 'danger');
  }
};

window.rejectKYC = async (userId) => {
  try {
    showLoader('Rejecting KYC...');
    await KYC.decision(userId, 'rejected');
    hideLoader();
    showToast('✓ KYC rejected', 'success');
    initKYCQueue();
  } catch (error) {
    hideLoader();
    showToast('Error: ' + error.message, 'danger');
  }
};

window.approveLoan = async (loanId) => {
  try {
    showLoader('Approving loan...');
    await Loans.decision(loanId, 'approved');
    hideLoader();
    showToast('✓ Loan approved', 'success');
    initLoanQueue();
  } catch (error) {
    hideLoader();
    showToast('Error: ' + error.message, 'danger');
  }
};

window.declineLoan = async (loanId) => {
  try {
    showLoader('Declining loan...');
    await Loans.decision(loanId, 'declined');
    hideLoader();
    showToast('✓ Loan declined', 'success');
    initLoanQueue();
  } catch (error) {
    hideLoader();
    showToast('Error: ' + error.message, 'danger');
  }
};

// Placeholder functions (implement as needed)
const initAnalytics = async () => { console.log('Analytics page'); };
const initAds = async () => { console.log('Ads page'); };
const initStudents = async () => { console.log('Students page'); };
const initSettings = async () => { console.log('Settings page'); };

// ────────────────────────────────────────────────────────────
// INITIALIZE ON PAGE LOAD
// ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', initApp);

export { initApp, AppState };
