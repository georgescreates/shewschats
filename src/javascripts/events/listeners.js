import { DOM } from '../dom.js';
import { showSection, redirectToLoginWithDelay, switchAuthForm  } from '../ui/toggleSections.js';
import { auth } from '../auth/firebaseAuth.js'; // adjust path if needed

export function initSectionSwitching() {
    const delayedSections = new Set(['chats', 'calls', 'games', 'notifs', 'earnings', 'stats', 'account']);

    DOM.sideMenuButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Side menu button clicked');
        
            const target = button.getAttribute('data-target');
            const key = target.replace('-section', '');
            const needsLoading = delayedSections.has(key);
        
            const user = auth.currentUser;
            console.log('auth.currentUser:', user);
        
            if (user) {
                showSection(key, needsLoading);
            } else {
                redirectToLoginWithDelay(key);                         
            }
        });        
    });
}

export function initAuthFormSwitching() {
    const toSignupBtn = document.getElementById('to-signup-form');
    const toLoginBtn = document.getElementById('to-login-form');

    if (toSignupBtn) {
        toSignupBtn.addEventListener('click', (e) => {
            e.preventDefault(); // prevent form submission
            switchAuthForm('signup');
        });
    }

    if (toLoginBtn) {
        toLoginBtn.addEventListener('click', (e) => {
            e.preventDefault(); // prevent form submission
            switchAuthForm('login');
        });
    }
}