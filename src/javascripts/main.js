import { initSectionSwitching, initAuthFormSwitching, initLogoutHandler, initPasswordResetLink } from './events/listeners.js';
import { showSection, hideLoadingWindow, hideLoginWindow, hideSignupWindow } from './ui/toggleSections.js';
import { initLoginForm } from './auth/loginHandler.js';
import { initSignupForm } from './auth/signupHandler.js';
import { initPasswordResetForm } from './auth/resetPasswordHandler.js';
import { DOM } from './dom.js';
import { auth } from './auth/firebaseAuth.js'; // Adjust if path differs

// Hide all sections except checkup
for (const key in DOM.sections) {
  if (key !== 'checkup') {
    DOM.sections[key].classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initSectionSwitching();
  initAuthFormSwitching();
  initLoginForm();
  initSignupForm();
  initLogoutHandler();
  initPasswordResetLink();
  initPasswordResetForm();

  const loadingWindow = document.getElementById('loading-window');
  if (loadingWindow) {
    loadingWindow.classList.remove('hidden');
    loadingWindow.classList.add('flex');
  }

  auth.onAuthStateChanged(async user => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    hideLoadingWindow();
  
    if (user) {
      console.log('👤 Logged in:', user.uid);
      hideLoginWindow();
      hideSignupWindow();
      showSection('chats', true); // or last visited section
    } else {
      console.log('🚪 Not logged in — show login UI');
  
      Object.entries(DOM.sections).forEach(([key, section]) => {
        if (key === 'checkup') {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });
  
      const loginWindow = document.getElementById('login-window');
      loginWindow?.classList.remove('hidden');
      loginWindow?.classList.add('flex');
  
      const loginForm = document.getElementById('login-form');
      const loginBtn = document.getElementById('login-submit-form-btn');
      if (loginForm) loginForm.reset();
      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.classList.add('opacity-50', 'cursor-not-allowed');
        loginBtn.classList.remove('cursor-pointer');
      }
  
      document.querySelectorAll('.form-part-alert-container').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('flex');
      });
    }
  });         
});
