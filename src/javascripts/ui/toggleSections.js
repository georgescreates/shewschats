import { DOM } from '../dom.js';

const loadingMessages = {
    chats: "Loading your chats...",
    calls: "Loading call history...",
    games: "Loading game store...",
    notifs: "Loading notifications...",
    earnings: "Fetching your earnings...",
    stats: "Gathering your stats...",
    account: "Preparing account info...",
    logout: "Logging you out..."
};

function showLoadingForSection(sectionKey) {
    const loadingWindow = document.getElementById('loading-window');
    const loadingText = document.getElementById('loading-window-message-container');

    if (loadingText) {
        loadingText.textContent = loadingMessages[sectionKey] || "Loading...";
    }

    if (loadingWindow) {
        loadingWindow.classList.remove('hidden');
        loadingWindow.classList.add('flex');
    }

    DOM.sideMenuButtons.forEach(btn => {
        const target = btn.getAttribute('data-target');
        btn.classList.toggle('active', target === `${sectionKey}-section`);
    });
}

export function showSection(sectionKey, withLoading = false) {
    const loadingWindow = document.getElementById('loading-window');

    const performSwitch = () => {
        for (const key in DOM.sections) {
            DOM.sections[key].classList.toggle('hidden', key !== sectionKey);
        }
    };

    if (withLoading) {
        showLoadingForSection(sectionKey);

        const checkupSection = document.getElementById('checkup-section');
        if (checkupSection) {
            checkupSection.classList.remove('hidden');
        }

        requestAnimationFrame(() => {
            setTimeout(() => {
                loadingWindow?.classList.add('hidden');
                loadingWindow?.classList.remove('flex');
                performSwitch();
            }, 1000);
        });
    } else {
        performSwitch();
    }
}

export function hideLoadingWindow() {
    const loadingWindow = document.getElementById('loading-window');
    if (loadingWindow) {
        loadingWindow.classList.add('hidden');
        loadingWindow.classList.remove('flex');
    }
}

export function switchAuthForm(target) {
    const loginWindow = document.getElementById('login-window');
    const signupWindow = document.getElementById('signup-window');

    if (target === 'signup') {
        loginWindow?.classList.add('hidden');
        loginWindow?.classList.remove('flex');
        signupWindow?.classList.remove('hidden');
        signupWindow?.classList.add('flex');
    } else if (target === 'login') {
        signupWindow?.classList.add('hidden');
        signupWindow?.classList.remove('flex');
        loginWindow?.classList.remove('hidden');
        loginWindow?.classList.add('flex');
    }
}

export function hideLoginWindow() {
    const login = document.getElementById('login-window');
    if (login) {
        login.classList.add('hidden');
        login.classList.remove('flex');
    }
}

export function hideSignupWindow() {
    const signup = document.getElementById('signup-window');
    if (signup) {
        signup.classList.add('hidden');
        signup.classList.remove('flex');
    }
}

export function redirectToLoginWithDelay(sectionKey) {
    const checkupSection = document.getElementById('checkup-section');
    const loginWindow = document.getElementById('login-window');
    const loadingWindow = document.getElementById('loading-window');

    Object.values(DOM.sections).forEach(sec => sec.classList.add('hidden'));

    showLoadingForSection(sectionKey);
    checkupSection?.classList.remove('hidden');

    setTimeout(() => {
        loadingWindow?.classList.add('hidden');
        loadingWindow?.classList.remove('flex');

        loginWindow?.classList.remove('hidden');
        loginWindow?.classList.add('flex');
    }, 1000);
}


export function showResetPasswordWindow() {
    const loginWindow = document.getElementById('login-window');
    const resetWindow = document.getElementById('reset-password-window');

    loginWindow?.classList.add('hidden');
    loginWindow?.classList.remove('flex');

    resetWindow?.classList.remove('hidden');
    resetWindow?.classList.add('flex');
}

export function initAccountTabSwitching() {
    const tabButtons = document.querySelectorAll('.account-resources-tab-btn');
    const accountTabs = document.querySelectorAll('.account-resources-tab');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetKey = btn.dataset.tab;
            const targetTab = document.getElementById(`account-${targetKey}-tab`);

            // Update buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update panes
            accountTabs.forEach(tab => tab.classList.add('hidden'));
            targetTab?.classList.remove('hidden');
            targetTab?.classList.add('flex');
        });
    });
}
