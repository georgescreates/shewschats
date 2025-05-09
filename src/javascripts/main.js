import { initSectionSwitching, initAuthFormSwitching } from './events/listeners.js';
import { showSection, hideLoadingWindow, hideLoginWindow, hideSignupWindow } from './ui/toggleSections.js';
import { initLoginForm } from './auth/loginHandler.js';
import { initSignupForm } from './auth/signupHandler.js';
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

  const loadingWindow = document.getElementById('loading-window');
  if (loadingWindow) {
    loadingWindow.classList.remove('hidden');
    loadingWindow.classList.add('flex');
  }

  auth.onAuthStateChanged(user => {
    hideLoadingWindow();

    if (user) {
      hideLoginWindow(); // Optional utility
      hideSignupWindow();
      showSection('chats', true); // Authenticated: show chats
    } else {
      const loginWindow = document.getElementById('login-window');
      if (loginWindow) {
        loginWindow.classList.remove('hidden');
        loginWindow.classList.add('flex');
      }
    }
  });
});
