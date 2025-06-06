import { initSectionSwitching, initAuthFormSwitching, initLogoutHandler, initPasswordResetLink } from './events/listeners.js';
import { showSection, hideLoadingWindow, hideLoginWindow, hideSignupWindow, initAccountTabSwitching } from './ui/toggleSections.js';
import { initUsernameEdit, initBioEdit } from './ui/editDatas.js';


import { initLoginForm } from './auth/loginHandler.js';
import { initSignupForm } from './auth/signupHandler.js';
import { initPasswordResetForm } from './auth/resetPasswordHandler.js';


import { initAccountGalleryUpload, createImageSquare, updatePhotoCounter } from './ui/uploadImages.js';

import { initVideoUpload, displayUserVideos, updateVideoInfoDisplay } from './ui/uploadVideos.js';
import { setupCameraRecorder } from './ui/recordVideos.js';

import { initWishlistInputWatcher, createWishlistCard, appendToWishlistGrid, updateWishlistInfoDisplay } from './ui/addToWishlist.js';


import { DOM } from './dom.js';
import { db } from './data/firebaseConfig.js';
import { auth } from './auth/firebaseAuth.js'; // Adjust if path differs

// Hide all sections except checkup initially
for (const key in DOM.sections) {
  if (key !== 'checkup') {
    DOM.sections[key].classList.add('hidden');
  }
}

/**
 * Calculates the age from a given date of birth.
 * @param {Date|string} dob - The date of birth.
 * @returns {number|string} The age or '---' if DOB is invalid.
 */
function getAgeFromDOB(dob) {
  const dobDate = dob instanceof Date ? dob : new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - dobDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > dobDate.getMonth() ||
    (today.getMonth() === dobDate.getMonth() && today.getDate() >= dobDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age;
}

/**
 * Extracts the Firebase Storage path from a given download URL.
 * This is useful for older photo entries that only stored the URL.
 * @param {string} url - The Firebase Storage download URL.
 * @returns {string|null} The decoded file path or null if parsing fails.
 */
function getPathFromDownloadURL(url) {
  try {
    const urlObj = new URL(url);
    // The path in Firebase Storage URLs is after '/o/' and before any query parameters.
    const pathWithO = urlObj.pathname;
    // Remove '/o/' and decode URL components (e.g., %2F to /)
    const decodedPath = decodeURIComponent(pathWithO.substring(3));
    return decodedPath;
  } catch (e) {
    console.error("Failed to parse URL for path extraction:", url, e);
    return null;
  }
}

/**
 * Displays user photos in the gallery grid.
 * Handles both old (URL string) and new (object with url and path) photo formats.
 * @param {Array<string|Object>} photos - An array of photo entries.
 */
async function displayUserPhotos(photos = []) {
  const galleryGrid = document.getElementById('account-galery-grid');
  if (!galleryGrid) return;

  galleryGrid.innerHTML = '';

  let row;
  photos.forEach((entry, index) => {
    const rawUrl = typeof entry === 'string' ? entry : entry.url;
    const rawPath = typeof entry === 'string' ? null : entry.path;

    if (!rawUrl || typeof rawUrl !== 'string') {
      console.warn('🚨 Skipping invalid photo entry:', entry);
      return;
    }

    const square = createImageSquare(rawUrl, rawPath, true, false); // ✅ include rawPath

    if (index % 3 === 0) {
      row = document.createElement('div');
      row.className = 'gallery-row flex flex-row gap-1 w-full';
      galleryGrid.appendChild(row);
    }

    row.appendChild(square);
  });

  updatePhotoCounter();
}


document.addEventListener('DOMContentLoaded', () => {
  initSectionSwitching();
  initAuthFormSwitching();
  initLoginForm();
  initSignupForm();
  initLogoutHandler();
  initPasswordResetLink();
  initPasswordResetForm();

  initAccountGalleryUpload();
  initAccountTabSwitching();

  initWishlistInputWatcher();

  initVideoUpload();
  setupCameraRecorder();


  const loadingWindow = document.getElementById('loading-window');
  if (loadingWindow) {
    loadingWindow.classList.remove('hidden');
    loadingWindow.classList.add('flex');
  }

  // Listen for Firebase authentication state changes
  auth.onAuthStateChanged(async user => {
    // Add a small delay for smoother transition
    await new Promise(resolve => setTimeout(resolve, 1500));

    hideLoadingWindow();

    if (user) {
      // User is logged in
      hideLoginWindow();
      hideSignupWindow();
      showSection('account', true);

      // Fetch user data from Firestore
      const doc = await db.collection('users').doc(user.uid).get();
      const data = doc.data();

      if (data) {
        const name = data?.firstName || 'Unknown';
        const dobTimestamp = data?.dob;
        const dobDate = dobTimestamp?.toDate?.() || null;
        const username = data?.username || 'nameless';
        const shewID = data?.roles?.shewID || '---';
        const age = dobDate ? getAgeFromDOB(dobDate) : '---';

        document.getElementById('profile-info-name').textContent = name;
        document.getElementById('profile-info-age').textContent = " • " + `${age}`;
        document.getElementById('profile-info-username').textContent = username;
        // initUsernameEdit(username);
        document.getElementById('profile-info-shewid').textContent = shewID;

        const bioDiv = document.getElementById('profile-bio-text-area');
        bioDiv.innerHTML = data.bio || '';

        // Adjust bio text area height if content overflows
        // if (bioDiv.scrollHeight > bioDiv.clientHeight) {
        //   bioDiv.style.height = bioDiv.scrollHeight + 'px';
        // }

        // initBioEdit();

        // Ensure data.photos is an array for displayUserPhotos
        if (Array.isArray(data.photos)) {
          displayUserPhotos(data.photos);
        } else {
          displayUserPhotos([]); // Ensure it's always an array if no photos exist
        }

        const wishlistTab = document.getElementById('wishlist-tab-btn');
        if (wishlistTab && Array.isArray(data.wishlist)) {
          data.wishlist.forEach(item => {
            const card = createWishlistCard(item);
            appendToWishlistGrid(card);
          });

          updateWishlistInfoDisplay(data.wishlist);
        }

        const videoLimits = data.accountTiers?.max?.videos || { count: 6, singleStorage: 30720 };

        if (Array.isArray(data.videos)) {
          displayUserVideos(data.videos, videoLimits);
          updateVideoInfoDisplay(data.videos, videoLimits);
        } else {
          displayUserVideos([], videoLimits);
        }

      }
    } else {
      // User is logged out
      Object.entries(DOM.sections).forEach(([key, section]) => {
        if (key === 'checkup') {
          section.classList.remove('hidden');
        } else {
          section.classList.add('hidden');
        }
      });

      const loginWindow = document.getElementById('login-window');
      loginWindow?.classList.remove('hidden');
      loginWindow?.classList.add('flex');

      const loginForm = document.getElementById('login-form');
      const loginBtn = document.getElementById('login-submit-form-btn');
      if (loginForm) loginForm.reset();
      if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.classList.add('opacity-50', 'cursor-not-allowed');
        loginBtn.classList.remove('cursor-pointer');
      }

      document.querySelectorAll('.form-part-alert-container').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('flex');
      });
    }
  });
});