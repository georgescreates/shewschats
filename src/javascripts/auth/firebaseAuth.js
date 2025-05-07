import { auth } from '../data/firebaseConfig.js';
export { auth };

export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        updateAuthUI(user);
    });
}
