import { DOM } from '../dom.js';
import { toggleSection } from '../ui/toggleSections.js';

export function addUIListeners() {
    DOM.sideMenuButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const sectionIds = Object.keys(DOM.sections);
            toggleSection(sectionIds[index]);
        });
    });
}
