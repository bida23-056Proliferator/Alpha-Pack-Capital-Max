// ═══════════════════════════════════════════════════════════════
// ALPHA PACK CAPITAL MAX — v6.0 · Business Configuration
// ═══════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// SUPABASE CONFIGURATION
// ────────────────────────────────────────────────────────────
export const SUPABASE_URL = "https://rhrkcfalfahlshvlllwd.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJocmtjZmFsZmFobHNodmxsbHdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjMxNjEsImV4cCI6MjA4ODc5OTE2MX0.2bVyuZeBdX8ke6GKSXziHG75PgSS-gyxkxCw-lm7oz4";

// ────────────────────────────────────────────────────────────
// BUSINESS PROFILE
// ────────────────────────────────────────────────────────────
export const BIZ = {
  // Brand
  name: "Alpha Pack Capital Max",
  shortName: "APCM",
  tagline: "Student Financial Solutions for Botswana",
  description: "Reliable student lending partner with clear terms and real money.",
  year: new Date().getFullYear(),

  // Location
  country: "Botswana",
  city: "Gaborone",

  // Currency
  currency: "P",
  currencyFull: "BWP (Pula)",
  currencySymbol: "P",

  // Contact
  phone1: "+267 76 807 549",
  phone2: "+267 78 322 911",
  wa1: "26776807549",
  wa2: "26778322911",
  email: "support@alphapackcapitalmax.bw",
  whatsappMessage: "Hi! I'm interested in a student loan from Alpha Pack Capital Max.",

  // Hours
  businessHours: "Monday–Friday 08:00 – 17:00 (WAT)",
  timezone: "Africa/Gaborone",

  // Financial Terms
  interestRateMin: 0.25,    // 25% for loans > P1,000
  interestRateMax: 0.30,    // 30% for loans ≤ P1,000
  interestDisplay: "25%–30%",
  repaymentDays: 30,        // Default repayment window
  repaymentDaysOptions: [14, 21, 30],
  minLoan: 100,
  maxLoan: 5000,

  // Loan Packages
  packages: [
    {
      id: "starter",
      label: "Starter",
      emoji: "🚀",
      color: "primary",
      min: 100,
      max: 500,
      description: "Quick everyday expenses",
      perks: ["Instant approval", "Same-day funding"]
    },
    {
      id: "boost",
      label: "Boost",
      emoji: "📚",
      color: "info",
      min: 500,
      max: 1000,
      description: "Medium academic costs",
      perks: ["Higher limits", "Flexible repayment"]
    },
    {
      id: "advance",
      label: "Advance",
      emoji: "🎓",
      color: "success",
      min: 1000,
      max: 2000,
      description: "Major educational support",
      perks: ["Competitive rates", "Expert review"]
    },
    {
      id: "premium",
      label: "Premium",
      emoji: "💎",
      color: "accent",
      min: 2000,
      max: 5000,
      description: "Full-semester coverage",
      perks: ["Premium support", "Priority processing"]
    },
  ],

  // Company Info
  established: "2022",
  version: "6.0",
  studentOnly: true,
  requiresKYC: true,
  kycTimeout: 2,  // days for admin review

  // Monetization
  adPriceMonth: 350,
  adMinDays: 30,

  // Feature Flags
  features: {
    cameraCapture: true,
    emailVerification: true,
    twoFactor: false,
    loanCalculator: true,
    analytics: true,
    adSystem: true,
    apiIntegration: false,
  },

  // Limits
  registrationLimitPerDay: 100,
  loanApplicationsPerStudent: 3,
  maxKYCDocSize: 5, // MB
  maxKYCDocCount: 2,

  // Messages
  messages: {
    welcome: "Welcome to Alpha Pack Capital Max – Botswana's most reliable student lending platform.",
    registerSuccess: "Account created! Check your email to confirm, then log in.",
    loginSuccess: "Welcome back! 👋",
    kycSubmitted: "Your Student ID has been submitted for review. We typically respond within 1-2 business days.",
    kycApproved: "Congratulations! Your Student ID is verified. You can now apply for loans.",
    loanSubmitted: "Your loan application has been submitted. Our team will review it shortly.",
    loanApproved: "Excellent news! Your loan has been approved. Funds will be transferred within 24 hours.",
    loanDeclined: "Thank you for applying. Unfortunately, we couldn't approve your application at this time.",
    error: "Something went wrong. Please try again or contact support.",
  }
};

// ────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ────────────────────────────────────────────────────────────

/**
 * Format currency with Pula
 */
export const P = (amount) => {
  const num = Number(amount) || 0;
  return `${BIZ.currencySymbol} ${num.toLocaleString("en-BW", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Calculate loan totals with interest
 */
export const calcLoan = (principal, repaymentDays = BIZ.repaymentDays) => {
  const p = Number(principal) || 0;
  const rate = p > 1000 ? BIZ.interestRateMin : BIZ.interestRateMax;
  const interest = Math.round(p * rate);
  const total = p + interest;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (repaymentDays || BIZ.repaymentDays));

  return {
    principal: p,
    rate: (rate * 100).toFixed(0),
    interest,
    total,
    repaymentDays: repaymentDays || BIZ.repaymentDays,
    dueDate: dueDate.toISOString().split("T")[0],
  };
};

/**
 * Get package by ID
 */
export const getPackage = (id) => {
  return BIZ.packages.find(p => p.id === id);
};

/**
 * Get all packages
 */
export const getPackages = () => {
  return BIZ.packages;
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-BW", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Format relative time (ago)
 */
export const formatAgo = (date) => {
  if (!date) return "—";
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

/**
 * WhatsApp link generator
 */
export const whatsappLink = (phone, message = "") => {
  const cleanPhone = phone.replace(/\D/g, "");
  const text = message || BIZ.whatsappMessage;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone
 */
export const validatePhone = (phone) => {
  const regex = /^[\d+\-\s()]{10,}$/;
  return regex.test(phone);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*]/.test(password),
    isStrong: password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password),
  };
};

/**
 * Format status badge
 */
export const getStatusBadge = (status) => {
  const statusMap = {
    "not_started": { color: "neutral", label: "Not Started" },
    "pending": { color: "warning", label: "Pending Review" },
    "approved": { color: "success", label: "Approved" },
    "rejected": { color: "danger", label: "Rejected" },
    "verified": { color: "success", label: "Verified" },
    "declined": { color: "danger", label: "Declined" },
  };
  return statusMap[status] || { color: "neutral", label: status };
};

export default { BIZ, P, calcLoan, getPackage, getPackages };
