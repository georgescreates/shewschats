import { auth, db } from '../data/firebaseConfig.js';

function obfuscateEmail(email) {
    const [local, domain] = email.split('@');

    const mask = (str) => {
        if (str.length <= 2) return str;
        return str[0] + '*'.repeat(str.length - 2) + str[str.length - 1];
    };

    return `${mask(local)}@${mask(domain)}`;
}

export function initPasswordResetForm() {
    const form = document.getElementById('reset-password-form');
    const shewIdInput = document.getElementById('reset-password-shew-id-input');
    const submitBtn = document.getElementById('reset-password-submit-form-btn');
    const alertText = document.getElementById('reset-password-shew-id-alert');
    const alertIcons = alertText?.previousElementSibling?.children;
    const loadingSVG = document.querySelector('#loading-window svg');

    if (!form || !shewIdInput || !submitBtn || !alertText) return;

    shewIdInput.addEventListener('input', () => {
        const raw = shewIdInput.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 9);
        shewIdInput.value = raw.replace(/(.{3})(?=.)/g, '$1-');
        validateInput();
    });

    shewIdInput.addEventListener('blur', validateInput);

    function validateInput() {
        const isValid = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(shewIdInput.value.trim());
        submitBtn.disabled = !isValid;
        submitBtn.classList.toggle('opacity-50', !isValid);
        submitBtn.classList.toggle('cursor-not-allowed', !isValid);
        submitBtn.classList.toggle('cursor-pointer', isValid);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const shewID = shewIdInput.value.trim().toUpperCase();
        const originalBtnHTML = submitBtn.innerHTML;

        showAlert('', 'none');
        submitBtn.disabled = true;
        submitBtn.innerHTML = loadingSVG?.outerHTML || 'Sending...';
        submitBtn.classList.add('opacity-50', 'cursor-not-allowed');

        try {
            const snapshot = await db.collection('users')
                .where('roles.isShew', '==', true)
                .where('roles.shewID', '==', shewID)
                .limit(1)
                .get();

            if (snapshot.empty) {
                showAlert('No SHEW account found with that ID.', 'error');
                return;
            }

            const email = snapshot.docs[0].data().email?.value;
            await auth.sendPasswordResetEmail(email);

            showAlert(`Reset link sent to: ${obfuscateEmail(email)}`, 'success');
            shewIdInput.disabled = true;
            submitBtn.disabled = true;
        } catch (err) {
            console.error(err);
            showAlert('Something went wrong. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalBtnHTML;
        }
    });

    function showAlert(message, type) {
        alertText.textContent = message;

        const container = alertText.parentElement;
        if (!container) return;

        container.classList.toggle('hidden', !message);
        container.classList.toggle('flex', !!message);

        alertText.classList.remove('text-cinnabar-600', 'text-green-700');
        alertText.classList.add(type === 'success' ? 'text-green-700' : 'text-cinnabar-600');

        if (alertIcons?.length) {
            for (let i = 0; i < alertIcons.length; i++) {
                alertIcons[i].classList.add('hidden');
            }
            if (type === 'success') alertIcons[0]?.classList.remove('hidden');
            else if (type === 'error') alertIcons[1]?.classList.remove('hidden');
        }
    }
}