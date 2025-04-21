import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../data/firebaseConfig.js';
import { updateAuthUI } from './authState.js';

export function initAuth() {
    onAuthStateChanged(auth, (user) => {
        updateAuthUI(user);
    });
}
