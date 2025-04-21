import { initAuth } from './auth/firebaseAuth.js';
import { addUIListeners } from './events/listeners.js';
import { loadDOM } from './dom.js';

document.addEventListener('DOMContentLoaded', () => {
  loadDOM();         // Grab all selectors & assign them to global refs
  initAuth();        // Firebase listener for user state
  addUIListeners();  // Set up all click/hover/submit event hooks
});