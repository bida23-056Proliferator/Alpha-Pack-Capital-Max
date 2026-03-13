// ═══════════════════════════════════════════════════════════════
// ALPHA PACK CAPITAL MAX — v6.0 · UI Utilities Module
// Advanced UI Components & Utilities
// ═══════════════════════════════════════════════════════════════

/**
 * Show toast notification
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  const toast = document.createElement('div');
  const typeStyles = {
    success: { bg: '#d1fae5', border: '#10b981', text: '#047857' },
    danger: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    info: { bg: '#dbeafe', border: '#0ea5e9', text: '#0c4a6e' }
  };

  const style = typeStyles[type] || typeStyles.info;

  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 400px;
      padding: 16px;
      background: ${style.bg};
      border-left: 4px solid ${style.border};
      border-radius: 8px;
      color: ${style.text};
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 9999;
      animation: slideInRight 0.3s ease-out;
    ">
      ${message}
    </div>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

/**
 * Show loading spinner
 */
export const showLoader = (message = 'Loading...') => {
  const loader = document.createElement('div');
  loader.id = 'app-loader';
  loader.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      backdrop-filter: blur(4px);
    ">
      <div style="text-align: center;">
        <div style="
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255,255,255,0.2);
          border-top-color: #5283f5;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        "></div>
        <p style="color: white; font-weight: 500;">${message}</p>
      </div>
    </div>
  `;
  document.body.appendChild(loader);
};

/**
 * Hide loading spinner
 */
export const hideLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader) loader.remove();
};

/**
 * Show modal
 */
export const showModal = (title, content, actions = []) => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay active';
  modal.id = 'app-modal';

  let actionsHTML = '';
  if (actions.length > 0) {
    actionsHTML = `
      <div class="modal-footer">
        ${actions.map(action => `
          <button class="btn ${action.className || 'btn-secondary'}" onclick="this.dispatchEvent(new CustomEvent('action', { detail: '${action.id}' }))">
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">${title}</h2>
        <button class="modal-close" onclick="document.getElementById('app-modal').remove()">×</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      ${actionsHTML}
    </div>
  `;

  document.body.appendChild(modal);

  return {
    close: () => modal.remove(),
    onAction: (callback) => {
      modal.addEventListener('action', (e) => callback(e.detail));
    }
  };
};

/**
 * Format form errors
 */
export const formatErrors = (errors) => {
  const formatted = {};
  
  if (Array.isArray(errors)) {
    errors.forEach(error => {
      if (error.field) {
        formatted[error.field] = error.message;
      }
    });
  } else if (typeof errors === 'object') {
    Object.assign(formatted, errors);
  }

  return formatted;
};

/**
 * Show field error
 */
export const showFieldError = (fieldName, message) => {
  const field = document.querySelector(`[name="${fieldName}"]`);
  if (field) {
    field.classList.add('error');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
  }
};

/**
 * Clear field errors
 */
export const clearFieldErrors = () => {
  document.querySelectorAll('.form-error').forEach(e => e.remove());
  document.querySelectorAll('input.error, textarea.error, select.error').forEach(e => e.classList.remove('error'));
};

/**
 * Validate form
 */
export const validateForm = (formSelector, rules) => {
  const form = document.querySelector(formSelector);
  const errors = [];

  Object.entries(rules).forEach(([field, rule]) => {
    const input = form.querySelector(`[name="${field}"]`);
    if (!input) return;

    const value = input.value.trim();

    // Required
    if (rule.required && !value) {
      errors.push({ field, message: `${rule.label || field} is required` });
      return;
    }

    // Min length
    if (rule.minLength && value.length < rule.minLength) {
      errors.push({ field, message: `${rule.label || field} must be at least ${rule.minLength} characters` });
    }

    // Max length
    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push({ field, message: `${rule.label || field} must not exceed ${rule.maxLength} characters` });
    }

    // Email
    if (rule.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors.push({ field, message: 'Please enter a valid email address' });
    }

    // Phone
    if (rule.phone && value && !/^[\d+\-\s()]{10,}$/.test(value)) {
      errors.push({ field, message: 'Please enter a valid phone number' });
    }

    // Custom
    if (rule.custom && !rule.custom(value)) {
      errors.push({ field, message: rule.customMessage || `${field} is invalid` });
    }
  });

  return errors;
};

/**
 * Set form values
 */
export const setFormValues = (formSelector, values) => {
  const form = document.querySelector(formSelector);
  if (!form) return;

  Object.entries(values).forEach(([key, value]) => {
    const field = form.querySelector(`[name="${key}"]`);
    if (field) field.value = value || '';
  });
};

/**
 * Get form values
 */
export const getFormValues = (formSelector) => {
  const form = document.querySelector(formSelector);
  if (!form) return {};

  const formData = new FormData(form);
  const values = {};

  formData.forEach((value, key) => {
    values[key] = value;
  });

  return values;
};

/**
 * Debounce function
 */
export const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'P') => {
  const num = Number(amount) || 0;
  return `${currency} ${num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format phone for WhatsApp
 */
export const formatPhoneForWhatsApp = (phone) => {
  return phone.replace(/\D/g, '');
};

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast('✓ Copied to clipboard', 'success', 2000);
    return true;
  } catch (err) {
    showToast('Failed to copy', 'danger');
    return false;
  }
};

/**
 * Format date
 */
export const formatDate = (dateString, format = 'short') => {
  const date = new Date(dateString);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-BW', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-BW', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  
  return dateString;
};

/**
 * Format time ago
 */
export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  
  return formatDate(dateString);
};

/**
 * Get badge HTML
 */
export const getBadgeHTML = (status) => {
  const badges = {
    'pending': { color: 'warning', label: 'Pending' },
    'approved': { color: 'success', label: 'Approved' },
    'rejected': { color: 'danger', label: 'Rejected' },
    'not_started': { color: 'neutral', label: 'Not Started' },
    'verified': { color: 'success', label: 'Verified' },
    'declined': { color: 'danger', label: 'Declined' }
  };

  const badge = badges[status] || { color: 'neutral', label: status };
  return `<span class="badge badge-${badge.color}">${badge.label}</span>`;
};

/**
 * Scroll to element
 */
export const scrollToElement = (selector) => {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Is mobile device
 */
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Redirect with delay
 */
export const redirectAfter = (url, delay = 1000) => {
  setTimeout(() => {
    window.location.href = url;
  }, delay);
};

export default {
  showToast,
  showLoader,
  hideLoader,
  showModal,
  formatErrors,
  showFieldError,
  clearFieldErrors,
  validateForm,
  setFormValues,
  getFormValues,
  debounce,
  formatCurrency,
  formatPhoneForWhatsApp,
  copyToClipboard,
  formatDate,
  formatTimeAgo,
  getBadgeHTML,
  scrollToElement,
  isMobileDevice,
  redirectAfter
};
