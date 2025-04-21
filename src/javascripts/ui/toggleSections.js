import { DOM } from '../dom.js';

export function toggleSection(sectionId) {
    Object.entries(DOM.sections).forEach(([key, section]) => {
        section.classList.toggle('hidden', key !== sectionId);
    });

    DOM.sideMenuButtons.forEach((btn, i) => {
        const match = btn.title.toLowerCase().startsWith(sectionId.slice(0, 4));
        btn.classList.toggle('active', match);
    });
}
