import { db, auth } from '../data/firebaseConfig.js';

export function initUsernameEdit(initialUsername = '') {
    const usernameEl = document.getElementById('profile-info-username');
    const editBtn = document.getElementById('to-edit-username-btn');
    const saveBtn = document.getElementById('to-save-username-btn');
    const cancelBtn = document.getElementById('to-cancel-username-btn');

    if (!usernameEl || !editBtn || !saveBtn || !cancelBtn) return;

    let originalUsername = initialUsername;

    function placeCursorAtEnd(el) {
        const range = document.createRange();
        const sel = window.getSelection();

        range.selectNodeContents(el);
        range.collapse(false); // false = place at end

        sel.removeAllRanges();
        sel.addRange(range);
    }

    editBtn.addEventListener('click', () => {
        originalUsername = usernameEl.textContent.trim();
        usernameEl.contentEditable = 'true';
        usernameEl.focus();
        placeCursorAtEnd(usernameEl);

        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        cancelBtn.classList.remove('hidden');

        usernameEl.classList.add('outline-none');
    });

    cancelBtn.addEventListener('click', () => {
        usernameEl.textContent = originalUsername;
        usernameEl.contentEditable = 'false';

        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');

        usernameEl.classList.remove('border', 'border-pizza-500', 'px-1', 'rounded-sm');
    });

    saveBtn.addEventListener('click', async () => {
        const newUsername = usernameEl.textContent.trim();

        if (!/^[a-zA-Z0-9]{2,15}$/.test(newUsername)) {
            alert("Username must be 2–15 letters or digits.");
            return;
        }

        const originalSaveText = saveBtn.textContent;
        saveBtn.textContent = 'saving...';
        saveBtn.disabled = true;
        saveBtn.classList.add('opacity-0.5')

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("Not logged in");

            await db.collection('users').doc(user.uid).update({
                username: newUsername
            });

            usernameEl.contentEditable = 'false';
            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
            cancelBtn.classList.add('hidden');

            usernameEl.classList.remove('border', 'border-pizza-500', 'px-1', 'rounded-sm');
        } catch (err) {
            console.error("❌ Username update failed:", err.message);
            alert("Something went wrong. Try again later.");
        } finally {
            saveBtn.textContent = originalSaveText;
            saveBtn.disabled = false;
        }
    });

}

export function initBioEdit() {
    const bioDiv = document.getElementById('profile-bio-text-area');
    const charCounter = document.querySelector('#profile-bio-counter-container span:first-child');
    const editBtn = document.getElementById('to-edit-bio-btn');
    const saveBtn = document.getElementById('to-save-bio-btn');
    const cancelBtn = document.getElementById('to-cancel-bio-btn');

    if (!bioDiv || !editBtn || !saveBtn || !cancelBtn || !charCounter) return;

    let originalBio = bioDiv.textContent;

    function updateCharCounter() {
        charCounter.textContent = bioDiv.textContent.trim().length.toString().padStart(2, '0');
    }

    // ✅ Initialize on load
    updateCharCounter();
    if (bioDiv.scrollHeight > bioDiv.clientHeight) {
        bioDiv.style.height = bioDiv.scrollHeight + 'px';
    }

    bioDiv.addEventListener('input', () => {
        updateCharCounter();
        //autoResizeTextarea(bioDiv);  <-- REMOVE THIS LINE
        if (bioDiv.scrollHeight > bioDiv.clientHeight) {
            bioDiv.style.height = bioDiv.scrollHeight + 'px';
        }

    });


    editBtn.addEventListener('click', () => {
        bioDiv.setAttribute('contenteditable', 'true');
        bioDiv.focus();
        originalBio = bioDiv.innerHTML; // Store original bio on edit
        editBtn.classList.add('hidden');
        saveBtn.classList.remove('hidden');
        cancelBtn.classList.remove('hidden');
    });

    cancelBtn.addEventListener('click', () => {
        bioDiv.innerHTML = originalBio; // Changed from data.bio
        bioDiv.setAttribute('contenteditable', 'false');
        updateCharCounter();
        if (bioDiv.scrollHeight > bioDiv.clientHeight) {
            bioDiv.style.height = bioDiv.scrollHeight + 'px';
        }

        editBtn.classList.remove('hidden');
        saveBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
    });

    saveBtn.addEventListener('click', async () => {
        const newBio = bioDiv.textContent.trim();

        if (newBio.length > 256) {
            alert("Bio must be under 256 characters.");
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) throw new Error("User not logged in");

            await db.collection('users').doc(user.uid).update({
                bio: newBio
            });

            originalBio = newBio;
            bioDiv.setAttribute('contenteditable', 'false');
            updateCharCounter();
            if (bioDiv.scrollHeight > bioDiv.clientHeight) {
                bioDiv.style.height = bioDiv.scrollHeight + 'px';
            }

            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
            cancelBtn.classList.add('hidden');
        } catch (err) {
            console.error("❌ Bio update failed:", err.message);
            alert("Couldn't save bio. Try again later.");
        }
    });
    //autoResizeTextarea(bioDiv);  <-- REMOVE THIS LINE
    if (bioDiv.scrollHeight > bioDiv.clientHeight) {
        bioDiv.style.height = bioDiv.scrollHeight + 'px';
    }
}