import { auth, db } from '../data/firebaseConfig.js';
import { updateAuthUI } from './authState.js';
import { hideLoginWindow, showSection } from '../ui/toggleSections.js';

const loginForm = document.getElementById('login-form');
const shewIdInput = document.getElementById('login-shew-id-input');
const shewIdAlert = document.getElementById('login-shew-id-alert');

const passwordInput = document.getElementById('login-shew-password-input');
const passwordAlert = document.getElementById('login-shew-password-alert');
const toggleLoginPasswordVisibilityBtn = document.getElementById('toggle-login-password-visibility');

const loginBtn = document.getElementById('login-submit-form-btn');

const loadingSVG = document.querySelector('#loading-window svg');

// SHEW ID validation
shewIdInput.addEventListener('input', () => {
    const raw = shewIdInput.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const formatted = raw.slice(0, 9).replace(/(.{3})(?=.)/g, '$1-');
    shewIdInput.value = formatted;

    validateShewIdInput(); // ✅ NEW
    updateLoginButtonState();
});

function validateShewIdInput() {
    const value = shewIdInput.value.trim();

    if (value === '') {
        shewIdAlert.textContent = 'SHEW ID is required';
        shewIdAlert.parentElement.classList.remove('hidden');
        shewIdAlert.parentElement.classList.add('flex', 'flex-row');
    } else if (value.length < 11) {
        shewIdAlert.textContent = 'SHEW ID value is incomplete';
        shewIdAlert.parentElement.classList.remove('hidden');
        shewIdAlert.parentElement.classList.add('flex', 'flex-row');
    } else {
        shewIdAlert.parentElement.classList.add('hidden');
    }
}

shewIdInput.addEventListener('blur', () => {
    validateShewIdInput();
    updateLoginButtonState();
});

// Password validation
function validatePasswordInput() {
    const value = passwordInput.value.trim();

    if (value === '') {
        passwordAlert.textContent = 'Password is required';
        passwordAlert.parentElement.classList.remove('hidden');
        passwordAlert.parentElement.classList.add('flex', 'flex-row');
    } else if (value.length < 8) {
        passwordAlert.textContent = 'Password must be at least 8 characters';
        passwordAlert.parentElement.classList.remove('hidden');
        passwordAlert.parentElement.classList.add('flex', 'flex-row');
    } else {
        passwordAlert.parentElement.classList.add('hidden');
    }
}

passwordInput.addEventListener('input', () => {
    validatePasswordInput();
    updateLoginButtonState();
});

passwordInput.addEventListener('blur', () => {
    validatePasswordInput();
    updateLoginButtonState();
});

const originalContent = loginBtn.innerHTML;

export function initLoginForm() {
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const shewIdFormatted = shewIdInput.value.trim().toUpperCase(); // Ex: ABC-123-XYZ
        const shewIdClean = shewIdFormatted.replace(/-/g, ''); // ABC123XYZ
        const password = passwordInput.value.trim();

        // Basic front-end validation
        if (shewIdFormatted.length < 11 || password.length < 8) return;

        // Reset UI
        shewIdAlert.parentElement.classList.add('hidden');
        passwordAlert.parentElement.classList.add('hidden');

        // Show loading state
        loginBtn.disabled = true;
        loginBtn.innerHTML = loadingSVG?.outerHTML || 'Loading...';
        loginBtn.classList.add('opacity-50', 'cursor-not-allowed');
        loginBtn.classList.remove('cursor-pointer');

        try {
            // Look up user in Firestore by shewId
            const snapshot = await db.collection('users')
                .where('role', '==', 'shew')
                .where('shewId', '==', shewIdClean)
                .limit(1)
                .get();

            if (snapshot.empty) {
                // Not found → restore login button to normal
                loginBtn.innerHTML = originalContent;
                loginBtn.disabled = false;
                loginBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                loginBtn.classList.add('cursor-pointer');

                // Show the redirect suggestion
                shewIdAlert.textContent = 'No account found. Please check your SHEW ID or sign up.';
                shewIdAlert.parentElement.classList.remove('hidden');
                shewIdAlert.parentElement.classList.add('flex');

                return;
            }

            const userDoc = snapshot.docs[0];
            const email = userDoc.data().email;

            // Try sign in with email and password
            await auth.signInWithEmailAndPassword(email, password);

            // Success
            updateAuthUI(auth.currentUser);
            hideLoginWindow();
            showSection('chats', true);
            form.reset();

            loginBtn.innerHTML = originalContent;
            loginBtn.disabled = true;
            loginBtn.classList.add('opacity-50', 'cursor-not-allowed');
            loginBtn.classList.remove('cursor-pointer');

        } catch (error) {
            loginBtn.innerHTML = originalContent;
            loginBtn.disabled = false;
            loginBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            loginBtn.classList.add('cursor-pointer');

            if (error.code === 'auth/wrong-password') {
                passwordAlert.textContent = "SHEW ID and password don't match";
            } else {
                passwordAlert.textContent = error.message;
            }
            passwordAlert.parentElement.classList.remove('hidden');
        }
    });
}

// Format SHEW ID input: insert dashes every 3 characters
function formatShewID(rawValue) {
    return rawValue
        .replace(/[^a-zA-Z0-9]/g, '')        // Remove non-alphanumeric
        .toUpperCase()
        .slice(0, 9)
        .replace(/(.{3})(?=.)/g, '$1-');     // Insert dash every 3 chars
}

// Handle typing and pasting
shewIdInput.addEventListener('input', () => {
    const cursorPos = shewIdInput.selectionStart;
    const formatted = formatShewID(shewIdInput.value);
    shewIdInput.value = formatted;

    // Try to preserve cursor position (optional)
    shewIdInput.setSelectionRange(formatted.length, formatted.length);
});

shewIdInput.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    shewIdInput.value = formatShewID(text);
});

toggleLoginPasswordVisibilityBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleLoginPasswordVisibilityBtn.innerHTML = isHidden ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14.579 8.921q.494.495.822 1.314t.266 1.602q0 .202-.14.339q-.14.138-.342.138t-.34-.138t-.137-.34q.067-.669-.142-1.25q-.21-.58-.635-1.005t-1.025-.64t-1.256-.13q-.202.02-.359-.111t-.176-.333t.109-.358t.33-.176q.796-.1 1.634.218t1.39.87M12 6q-.59 0-1.165.066q-.576.067-1.14.205q-.214.056-.388-.057t-.241-.303q-.068-.207.039-.38t.314-.229q.633-.163 1.278-.233Q11.342 5 12 5q3.021 0 5.58 1.55t3.962 4.216q.1.18.14.354t.041.38t-.037.38t-.138.354q-.47.924-1.122 1.712t-1.434 1.456q-.165.14-.363.12q-.198-.022-.333-.199q-.134-.177-.106-.368q.027-.192.193-.332q.754-.652 1.369-1.433q.615-.78 1.048-1.69q-1.25-2.525-3.613-4.012T12 6m0 12q-2.966 0-5.452-1.562t-3.99-4.128q-.125-.181-.178-.39t-.053-.42t.05-.417t.175-.392q.615-1.039 1.364-1.97q.75-.933 1.734-1.644L3.21 4.631q-.14-.147-.147-.347q-.007-.201.153-.361q.159-.16.353-.16t.354.16l16.154 16.154q.14.14.153.341t-.153.366q-.16.16-.354.16t-.354-.16l-3.538-3.526q-.894.41-1.862.576Q13.002 18 12 18M6.358 7.785q-1.033.707-1.835 1.646q-.802.938-1.323 2.069q1.25 2.525 3.613 4.013T12 17q.789 0 1.562-.11q.773-.111 1.504-.398l-1.632-1.642q-.332.19-.688.247t-.746.057q-1.529 0-2.591-1.063T8.346 11.5q0-.39.067-.746t.237-.688zm4.354 4.354" stroke-width="0.25" stroke="currentColor" /></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class=""> <path fill="currentColor" d="M12.005 15.154q1.524 0 2.586-1.067t1.063-2.591t-1.067-2.587t-2.591-1.063t-2.587 1.067t-1.063 2.592t1.067 2.586t2.592 1.063M12 14.2q-1.125 0-1.912-.787T9.3 11.5t.788-1.912T12 8.8t1.913.788t.787 1.912t-.787 1.913T12 14.2m.003 3.8q-3.25 0-5.922-1.768T2.077 11.5q1.33-2.964 4.001-4.732T11.998 5t5.921 1.768t4.004 4.732q-1.33 2.964-4.001 4.732T12.002 18M12 17q2.825 0 5.188-1.487T20.8 11.5q-1.25-2.525-3.613-4.012T12 6T6.813 7.488T3.2 11.5q1.25 2.525 3.613 4.013T12 17" stroke-width="0.25" stroke="currentColor" /></svg>';
});

// Helper function to enable or disable the login button
function updateLoginButtonState() {
    const isShewIdValid = shewIdInput.value.trim().length === 11;
    const isPasswordValid = passwordInput.value.trim().length >= 8;

    loginBtn.disabled = !(isShewIdValid && isPasswordValid);
    loginBtn.classList.toggle('opacity-50', loginBtn.disabled);
    loginBtn.classList.toggle('cursor-not-allowed', loginBtn.disabled);
    loginBtn.classList.toggle('cursor-pointer', !loginBtn.disabled);
}