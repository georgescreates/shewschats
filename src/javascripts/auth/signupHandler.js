import { db, auth } from '../data/firebaseConfig.js';
import { updateAuthUI } from './authState.js';
import { hideSignupWindow, showSection } from '../ui/toggleSections.js';

const form = document.getElementById('signup-form');

const firstNameInput = document.getElementById('signup-firstname-input');
const dobInput = document.getElementById('signup-dob-input');
const usernameInput = document.getElementById('signup-username-input');
const emailInput = document.getElementById('signup-email-input');
const passwordInput = document.getElementById('signup-password-input');
const invitationInput = document.getElementById('signup-invitation-input');

const aboutYouAlertContainer = document.getElementById('signup-about-you-alert-container');
const aboutYouAlertText = document.getElementById('signup-about-you-alert');
const usernameAlertContainer = document.getElementById('signup-username-alert-container');
const usernameAlertText = document.getElementById('signup-username-alert');
const emailAlertContainer = document.getElementById('signup-email-alert-container');
const emailAlertText = document.getElementById('signup-email-alert');
const passwordAlertContainer = document.getElementById('signup-password-alert-container');
const passwordAlertText = document.getElementById('signup-password-alert');
const invitationAlertContainer = document.getElementById('signup-invitation-code-alert-container');
const invitationAlertText = document.getElementById('signup-invitation-code-alert');

const strengthBar = document.getElementById('password-strength-bar');
const requirementItems = document.querySelectorAll('.password-requirement-text');

const toggleSignupPasswordBtn = document.getElementById('signup-toggle-password-visibility-btn');

const signupBtn = document.getElementById('shew-signup-signup-btn');
const originalSignupBtnHTML = signupBtn.innerHTML;

const loadingSVG = document.querySelector('#loading-window svg'); // optional fallback

// Utility to compute age from DOB string (yyyy-mm-dd)
function getAgeFromDOB(dobStr) {
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const beforeBirthday = today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
    if (beforeBirthday) age--;
    return age;
}

function validateFirstName() {
    const name = firstNameInput.value.trim();

    if (name === '') {
        aboutYouAlertContainer.classList.remove('hidden');
        aboutYouAlertContainer.classList.add('flex');
        aboutYouAlertText.textContent = 'First name is required';
        return false;
    }

    if (name.length < 2) {
        aboutYouAlertContainer.classList.remove('hidden');
        aboutYouAlertContainer.classList.add('flex');
        aboutYouAlertText.textContent = 'First name must be at least 2 characters';
        return false;
    }

    if (/[^a-zA-Z\s'-]/.test(name)) {
        aboutYouAlertContainer.classList.remove('hidden');
        aboutYouAlertContainer.classList.add('flex');
        aboutYouAlertText.textContent = 'Only letters, spaces, apostrophes and hyphens are allowed';
        return false;
    }

    return true;
}

function validateDOB() {
    const dobValue = dobInput.value;
    if (!dobValue) {
        aboutYouAlertContainer.classList.remove('hidden');
        aboutYouAlertContainer.classList.add('flex');
        aboutYouAlertText.textContent = 'Date of birth is required';
        return false;
    }

    const age = getAgeFromDOB(dobValue);
    if (age < 22) {
        aboutYouAlertContainer.classList.remove('hidden');
        aboutYouAlertContainer.classList.add('flex');
        aboutYouAlertText.textContent = 'You must be at least 22 years old';
        return false;
    }

    return true;
}

function validateUsername() {
    const username = usernameInput.value.trim();

    if (username === '') {
        usernameAlertContainer.classList.remove('hidden');
        usernameAlertContainer.classList.add('flex');
        usernameAlertText.textContent = 'Username is required';
        return false;
    }

    if (username.length > 15) {
        usernameAlertContainer.classList.remove('hidden');
        usernameAlertContainer.classList.add('flex');
        usernameAlertText.textContent = 'Username must not exceed 15 characters';
        return false;
    }

    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        usernameAlertContainer.classList.remove('hidden');
        usernameAlertContainer.classList.add('flex');
        usernameAlertText.textContent = 'Only letters and numbers are allowed';
        return false;
    }

    usernameAlertContainer.classList.add('hidden');
    return true;
}

function validateEmail() {
    const email = emailInput.value.trim();

    if (email === '') {
        emailAlertContainer.classList.remove('hidden');
        emailAlertContainer.classList.add('flex');
        emailAlertText.textContent = 'Email is required';
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        emailAlertContainer.classList.remove('hidden');
        emailAlertContainer.classList.add('flex');
        emailAlertText.textContent = 'Please enter a valid email address';
        return false;
    }

    emailAlertContainer.classList.add('hidden');
    return true;
}

function validatePassword() {
    const value = passwordInput.value;

    const uppercaseMatches = value.match(/[A-Z]/g) || [];
    const lowercaseMatches = value.match(/[a-z]/g) || [];
    const digitMatches = value.match(/\d/g) || [];
    const specialMatches = value.match(/[^a-zA-Z0-9\s]/g) || [];

    // Validation rule list
    const rules = {
        notEmpty: value.length > 0,
        uppercases: uppercaseMatches.length >= 2,
        lowercases: lowercaseMatches.length >= 2,
        digits: digitMatches.length >= 2,
        specials: specialMatches.length >= 2
    };

    // Only style the 4 visible spans: [uppercases, lowercases, digits, specials]
    const requirementKeys = ['uppercases', 'lowercases', 'digits', 'specials'];
    requirementItems.forEach((el, idx) => {
        const ruleKey = requirementKeys[idx];
        const passed = rules[ruleKey];

        el.classList.remove('text-woodsmoke-700', 'text-woodsmoke-300');

        if (passed) {
            el.classList.add('text-woodsmoke-700'); // ✅ dark success
        } else {
            el.classList.add('text-woodsmoke-300'); // muted gray
        }
    });


    // Determine how many rules are met
    const totalPassed = Object.values(rules).filter(Boolean).length;
    const allPassed = totalPassed === 5;

    // Show error message if not all passed
    if (!rules.notEmpty) {
        passwordAlertContainer.classList.remove('hidden');
        passwordAlertContainer.classList.add('flex');
        passwordAlertText.textContent = 'Password is required';
    } else if (!allPassed) {
        passwordAlertContainer.classList.remove('hidden');
        passwordAlertContainer.classList.add('flex');
        passwordAlertText.textContent = 'Your password does not meet all requirements';
    } else {
        passwordAlertContainer.classList.add('hidden');
    }

    const strengthPercent = (totalPassed / 5) * 100;
    strengthBar.style.width = `${strengthPercent}%`;

    // Clear previous color classes
    strengthBar.className = 'h-full rounded-full';

    if (strengthPercent < 40) {
        strengthBar.classList.add('bg-cinnabar-600'); // red
    } else if (strengthPercent < 95) {
        strengthBar.classList.add('bg-pizza-500');
        strengthBar.classList.remove('bg-cinnabar-600'); // orange
    } else {
        strengthBar.classList.add('bg-green-600');
        strengthBar.classList.remove('bg-pizza-500');
        strengthBar.classList.remove('bg-cinnabar-600'); // green
    }


    return allPassed;
}

toggleSignupPasswordBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';

    // Optional: update button icon
    toggleSignupPasswordBtn.innerHTML = isHidden
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14.579 8.921q.494.495.822 1.314t.266 1.602q0 .202-.14.339q-.14.138-.342.138t-.34-.138t-.137-.34q.067-.669-.142-1.25q-.21-.58-.635-1.005t-1.025-.64t-1.256-.13q-.202.02-.359-.111t-.176-.333t.109-.358t.33-.176q.796-.1 1.634.218t1.39.87M12 6q-.59 0-1.165.066q-.576.067-1.14.205q-.214.056-.388-.057t-.241-.303q-.068-.207.039-.38t.314-.229q.633-.163 1.278-.233Q11.342 5 12 5q3.021 0 5.58 1.55t3.962 4.216q.1.18.14.354t.041.38t-.037.38t-.138.354q-.47.924-1.122 1.712t-1.434 1.456q-.165.14-.363.12q-.198-.022-.333-.199q-.134-.177-.106-.368q.027-.192.193-.332q.754-.652 1.369-1.433q.615-.78 1.048-1.69q-1.25-2.525-3.613-4.012T12 6m0 12q-2.966 0-5.452-1.562t-3.99-4.128q-.125-.181-.178-.39t-.053-.42t.05-.417t.175-.392q.615-1.039 1.364-1.97q.75-.933 1.734-1.644L3.21 4.631q-.14-.147-.147-.347q-.007-.201.153-.361q.159-.16.353-.16t.354.16l16.154 16.154q.14.14.153.341t-.153.366q-.16.16-.354.16t-.354-.16l-3.538-3.526q-.894.41-1.862.576Q13.002 18 12 18M6.358 7.785q-1.033.707-1.835 1.646q-.802.938-1.323 2.069q1.25 2.525 3.613 4.013T12 17q.789 0 1.562-.11q.773-.111 1.504-.398l-1.632-1.642q-.332.19-.688.247t-.746.057q-1.529 0-2.591-1.063T8.346 11.5q0-.39.067-.746t.237-.688zm4.354 4.354" stroke-width="0.25" stroke="currentColor" /></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class=""> <path fill="currentColor" d="M12.005 15.154q1.524 0 2.586-1.067t1.063-2.591t-1.067-2.587t-2.591-1.063t-2.587 1.067t-1.063 2.592t1.067 2.586t2.592 1.063M12 14.2q-1.125 0-1.912-.787T9.3 11.5t.788-1.912T12 8.8t1.913.788t.787 1.912t-.787 1.913T12 14.2m.003 3.8q-3.25 0-5.922-1.768T2.077 11.5q1.33-2.964 4.001-4.732T11.998 5t5.921 1.768t4.004 4.732q-1.33 2.964-4.001 4.732T12.002 18M12 17q2.825 0 5.188-1.487T20.8 11.5q-1.25-2.525-3.613-4.012T12 6T6.813 7.488T3.2 11.5q1.25 2.525 3.613 4.013T12 17" stroke-width="0.25" stroke="currentColor" /></svg>';
});

function formatInvitationInput() {
    let raw = invitationInput.value.replace(/[^a-zA-Z0-9]/g, ''); // remove non-alphanumerics
    raw = raw.slice(0, 16); // max 16 characters (excluding dashes)

    // Insert dash after every 4 chars
    const formatted = raw.match(/.{1,4}/g)?.join('-') || '';
    invitationInput.value = formatted;
}

function validateInvitationCode() {
    const raw = invitationInput.value.replace(/-/g, ''); // strip dashes
    const validChars = /^[a-zA-Z0-9]+$/;

    if (raw.length === 0) {
        invitationAlertContainer.classList.remove('hidden');
        invitationAlertContainer.classList.add('flex');
        invitationAlertText.textContent = 'Invitation code is required';
        return false;
    }

    if (raw.length !== 16) {
        invitationAlertContainer.classList.remove('hidden');
        invitationAlertContainer.classList.add('flex');
        invitationAlertText.textContent = 'Invitation code must be 16 characters';
        return false;
    }

    if (!validChars.test(raw)) {
        invitationAlertContainer.classList.remove('hidden');
        invitationAlertContainer.classList.add('flex');
        invitationAlertText.textContent = 'Only letters and digits are allowed';
        return false;
    }

    invitationAlertContainer.classList.add('hidden');
    return true;
}

function updateSignupButtonState() {
    const validName = validateFirstName();
    const validDOB = validateDOB();
    const validUsername = validateUsername();
    const validEmail = validateEmail();
    const validPassword = validatePassword();
    const validInvitation = validateInvitationCode();

    const isValid = validName && validDOB && validUsername && validEmail && validPassword && validInvitation;

    signupBtn.disabled = !isValid;
    signupBtn.classList.toggle('opacity-50', !isValid);
    signupBtn.classList.toggle('cursor-not-allowed', !isValid);
    signupBtn.classList.toggle('cursor-pointer', isValid);

    if (validName && validDOB) aboutYouAlertContainer.classList.add('hidden');
    if (validUsername) usernameAlertContainer.classList.add('hidden');
    if (validEmail) emailAlertContainer.classList.add('hidden');
    if (validPassword) passwordAlertContainer.classList.add('hidden');
    if (validInvitation) invitationAlertContainer.classList.add('hidden');
}

export function initSignupForm() {
    if (!form) return;

    firstNameInput.addEventListener('input', () => {
        validateFirstName();
        updateSignupButtonState();
    });

    firstNameInput.addEventListener('blur', () => {
        validateFirstName();
        updateSignupButtonState();
    });

    dobInput.addEventListener('input', () => {
        validateDOB();
        updateSignupButtonState();
    });

    dobInput.addEventListener('blur', () => {
        validateDOB();
        updateSignupButtonState();
    });

    usernameInput.addEventListener('input', () => {
        validateUsername();
        updateSignupButtonState();
    });

    usernameInput.addEventListener('blur', () => {
        validateUsername();
        updateSignupButtonState();
    });

    emailInput.addEventListener('input', () => {
        validateEmail();
        updateSignupButtonState();
    });

    emailInput.addEventListener('blur', () => {
        validateEmail();
        updateSignupButtonState();
    });

    passwordInput.addEventListener('input', () => {
        validatePassword();
        updateSignupButtonState();
    });

    passwordInput.addEventListener('blur', () => {
        validatePassword();
        updateSignupButtonState();
    });

    invitationInput.addEventListener('input', () => {
        formatInvitationInput();
        validateInvitationCode();
        updateSignupButtonState();
    });

    invitationInput.addEventListener('blur', () => {
        validateInvitationCode();
        updateSignupButtonState();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('🚀 Form submitted — handle signup in next step');
        // We’ll add Firestore + Auth logic in Step 2
    });
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rawCode = invitationInput.value.trim(); // e.g., 'VONA-H0pG-E3d8-H6j0'

    // Loading state
    signupBtn.disabled = true;
    signupBtn.innerHTML = loadingSVG?.outerHTML || 'Signing you up...';
    signupBtn.classList.add('opacity-50', 'cursor-not-allowed');
    signupBtn.classList.remove('cursor-pointer');

    try {
        const codeDocRef = db.collection('invitation-codes').doc(rawCode);
        const codeSnap = await codeDocRef.get();
    
        if (!codeSnap.exists) {
            invitationAlertContainer.classList.remove('hidden');
            invitationAlertContainer.classList.add('flex');
            invitationAlertText.textContent = 'Invalid invitation code';
    
            restoreSignupButton(); // utility to reset loading state
            return;
        }
    
        const data = codeSnap.data();
    
        // ✅ Check expiry
        const now = new Date();
        const expiryDate = data.expiry?.expiringOn?.toDate?.() || new Date(0);
        if (expiryDate < now) {
            invitationAlertContainer.classList.remove('hidden');
            invitationAlertContainer.classList.add('flex');
            invitationAlertText.textContent = 'This invitation code has expired';
            restoreSignupButton();
            return;
        }
    
        // ✅ Check usage count
        const usedByMap = data.usedBy || {};
        const usageCount = Object.keys(usedByMap).length;
        const usageLimit = data.usage?.limit || 1;
    
        if (usageCount >= usageLimit) {
            invitationAlertContainer.classList.remove('hidden');
            invitationAlertContainer.classList.add('flex');
            invitationAlertText.textContent = 'This invitation code has reached its usage limit';
            restoreSignupButton();
            return;
        }
    
        console.log('✅ Invitation code is valid and within usage limit');
    
        // ⏭️ Continue with account creation here...
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        let userCredential;

        try {
            userCredential = await auth.createUserWithEmailAndPassword(email, password);
        } catch (err) {
            console.error('❌ Error creating account:', err.message);
            passwordAlertText.textContent = err.message;
            passwordAlertContainer.classList.remove('hidden');
            restoreSignupButton();
            return;
        }
        
        const user = userCredential.user;

        function generateShewID() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let raw = '';
            for (let i = 0; i < 9; i++) raw += chars[Math.floor(Math.random() * chars.length)];
            return raw.replace(/(.{3})(?=.)/g, '$1-'); // Format as XXX-XXX-XXX
        }
        
        const shewId = generateShewID();
        
        await db.collection('users').doc(user.uid).set({
            email,
            shewId,
            username: usernameInput.value.trim(),
            firstName: firstNameInput.value.trim(),
            dob: dobInput.value.trim(),
            role: 'shew',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        
        await db.collection('invitation-codes').doc(rawCode).update({
            [`usedBy.${user.uid}`]: firebase.firestore.FieldValue.serverTimestamp()
        });

        await user.sendEmailVerification();

        updateAuthUI(user);
        hideSignupWindow();
        showSection('chats', true);
        form.reset();

    
    } catch (error) {
        console.error('🔥 Error verifying invitation code:', error);
        invitationAlertContainer.classList.remove('hidden');
        invitationAlertContainer.classList.add('flex');
        invitationAlertText.textContent = 'Error checking invitation code. Try again later.';
        restoreSignupButton();
    }
    
});

function restoreSignupButton() {
    signupBtn.disabled = false;
    signupBtn.innerHTML = originalSignupBtnHTML;
    signupBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    signupBtn.classList.add('cursor-pointer');
}