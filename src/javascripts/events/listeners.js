import { DOM } from '../dom.js';
import { showSection, redirectToLoginWithDelay, switchAuthForm, showResetPasswordWindow, hideLoginWindow, hideSignupWindow } from '../ui/toggleSections.js';
import { auth } from '../auth/firebaseAuth.js';
import { updateAuthUI } from '../auth/authState.js';

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

export function initLogoutHandler() {
    const logoutBtn = document.getElementById('logout-btn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', async () => {
        // Show loading message
        showSection('logout', true);

        // Force DOM paint
        await new Promise(requestAnimationFrame);

        try {
            await auth.signOut(); // Firebase clears session
            updateAuthUI(null);

            // Reload to reinit everything
            window.location.reload();
        } catch (err) {
            console.error("Logout error:", err.message);
            showSection('account');
        }
    });
}


export function initPasswordResetLink() {
    const forgotPasswordLink = document.getElementById('forgot-password-link');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showResetPasswordWindow();
        });
    }
}