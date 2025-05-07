import { auth } from "../data/firebaseConfig.js";
import { showSection, showLoadingScreenOnly, showLoginScreenOnly } from "../ui/toggleSections.js";

export async function checkUserAndSwitchSection(sectionKey) {
    showSection('checkup-section'); // Always first show the checkup-section (where loading and login live)
    showLoadingScreenOnly();         // Show only the loading window initially

    // Tiny delay for loading UX
    setTimeout(() => {
        const user = auth.currentUser;

        if (user) {
            showSection(sectionKey); // Authenticated → show the desired section
        } else {
            showSection('checkup-section'); // Stay in checkup-section
            showLoginScreenOnly(); // Show the login window
        }
    }, 400); // 400ms delay
}