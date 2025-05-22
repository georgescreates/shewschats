import { storage, db, auth } from '../data/firebaseConfig.js';

const MAX_SIZE_MB = 15;
const VALID_TYPES = ['image/jpeg', 'image/png'];

/**
 * Creates an image square element for display in the gallery.
 * @param {string} tempURL - The temporary or permanent URL of the image.
 * @param {string} filePath - The Firebase Storage path of the image.
 * @param {boolean} [showDelete=true] - Whether to show the delete button.
 * @param {boolean} [isUploading=false] - Whether the image is currently uploading.
 * @returns {HTMLDivElement} The created image square element.
 */
function createImageSquare(tempURL, filePath, showDelete = true, isUploading = false) {
    const div = document.createElement('div');
    div.className = 'account-galery-square aspect-square w-full h-full rounded-md relative overflow-hidden bg-cover bg-center';
    div.style.backgroundImage = `url('${tempURL}')`;
    div.style.opacity = isUploading ? '0.5' : '1';

    // Store both the filePath and the downloadUrl on the div's dataset
    if (filePath) {
        div.dataset.filePath = filePath;
    }
    div.dataset.downloadUrl = tempURL; // Store the actual download URL

    if (showDelete) {
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7.616 20q-.667 0-1.141-.475T6 18.386V6h-.5q-.213 0-.356-.144T5 5.499t.144-.356T5.5 5H9q0-.31.23-.54t.54-.23h4.46q.31 0 .54.23T15 5h3.5q.213 0 .356.144t.144.357t-.144.356T18.5 6H18v12.385q0 .666-.475 1.14t-1.14.475zM17 6H7v12.385q0 .269.173.442t.443.173h8.769q.269 0 .442-.173t.173-.442zm-6.692 11q.213 0 .357-.144t.143-.356v-8q0-.213-.144-.356T10.307 8t-.356.144t-.143.356v8q0 .213.144.356q.144.144.356.144m3.385 0q.213 0 .356-.144t.143-.356v-8q0-.213-.144-.356Q13.904 8 13.692 8q-.213 0-.357.144t-.143.356v8q0 .213.144.356t.357.144M7 6v13z" stroke-width="0.25" stroke="currentColor" /></svg>';
        deleteBtn.title = 'Delete';
        deleteBtn.className = 'absolute top-1 right-1 bg-cinnabar-600 text-cinnabar-50 rounded-sm p-1 text-xs z-30 hover:bg-cinnabar-700 cursor-pointer';

        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            // Using window.confirm for quick testing, replace with a custom modal for better UX
            if (!window.confirm("Delete this photo?")) return;

            try {
                const user = auth.currentUser;
                if (!user) throw new Error("Not logged in");

                // Show loading spinner
                deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
                                            <circle cx="4" cy="12" r="3" fill="currentColor" stroke-width="0.25" stroke="currentColor">
                                                <animate id="svgSpinners3DotsScale0" attributeName="r" begin="0;svgSpinners3DotsScale1.end-0.25s" dur="0.75s" values="3;.2;3" />
                                            </circle>
                                            <circle cx="12" cy="12" r="3" fill="currentColor" stroke-width="0.25" stroke="currentColor">
                                                <animate attributeName="r" begin="svgSpinners3DotsScale0.end-0.6s" dur="0.75s" values="3;.2;3" />
                                            </circle>
                                            <circle cx="20" cy="12" r="3" fill="currentColor" stroke-width="0.25" stroke="currentColor">
                                                <animate id="svgSpinners3DotsScale1" attributeName="r" begin="svgSpinners3DotsScale0.end-0.45s" dur="0.75s" values="3;.2;3" />
                                            </circle>
                                        </svg>`;

                const storedFilePath = div.dataset.filePath;
                const storedDownloadUrl = div.dataset.downloadUrl;

                if (!storedFilePath) {
                    console.error("⛔ Cannot delete: Missing file path in dataset for image:", storedDownloadUrl);
                    window.alert("Couldn’t delete image. Try again later.");
                    return;
                }

                // 1. Delete from Firebase Storage
                const storageRef = storage.ref(storedFilePath);
                await storageRef.delete();
                console.log("✅ Image deleted from Storage:", storedFilePath);

                // 2. Remove the corresponding photo object from Firestore
                const photoDataToRemove = {
                    url: storedDownloadUrl,
                    path: storedFilePath
                };

                // Fetch current photos, filter out the one to remove, then update
                const userDoc = await db.collection('users').doc(user.uid).get();
                const currentPhotos = userDoc.data()?.photos || [];
                const updatedPhotos = currentPhotos.filter(photo =>
                    photo.url !== photoDataToRemove.url || photo.path !== photoDataToRemove.path
                );

                await db.collection('users').doc(user.uid).update({
                    photos: updatedPhotos
                });
                console.log("✅ Image data removed from Firestore:", photoDataToRemove);

                // 3. Remove the image element from the DOM
                div.remove();
                updatePhotoCounter();

            } catch (err) {
                console.error("❌ Failed to delete image:", err.message, err);
                window.alert("Couldn't delete image. Try again later.");

                // Revert delete button to original icon on error
                deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7.616 20q-.667 0-1.141-.475T6 18.386V6h-.5q-.213 0-.356-.144T5 5.499t.144-.356T5.5 5H9q0-.31.23-.54t.54-.23h4.46q.31 0 .54.23T15 5h3.5q.213 0 .356.144t.144.357t-.144.356T18.5 6H18v12.385q0 .666-.475 1.14t-1.14.475zM17 6H7v12.385q0 .269.173.442t.443.173h8.769q.269 0 .442-.173t.173-.442zm-6.692 11q.213 0 .357-.144t.143-.356v-8q0-.213-.144-.356T10.307 8t-.356.144t-.143.356v8q0 .213.144.356q.144.144.356.144m3.385 0q.213 0 .356-.144t.143-.356v-8q0-.213-.144-.356Q13.904 8 13.692 8q-.213 0-.357.144t-.143.356v8q0 .213.144.356t.357.144M7 6v13z" stroke-width="0.25" stroke="currentColor" /></svg>';
            }
        });

        div.appendChild(deleteBtn);
    }

    // Add loader overlay if uploading
    if (isUploading) {
        const overlay = document.createElement('div');
        overlay.className = 'upload-loader-overlay absolute inset-0 bg-white opacity-70 flex items-center justify-center z-20';

        const mainLoader = document.querySelector('#loading-window svg');
        if (mainLoader) {
            overlay.innerHTML = mainLoader.outerHTML;
        } else {
            overlay.textContent = 'Uploading...';
        }

        div.appendChild(overlay);
    }

    return div;
}

/**
 * Updates the photo counter displayed on the photos tab button.
 */
function updatePhotoCounter() {
    const galleryGrid = document.getElementById('account-galery-grid');
    const count = galleryGrid?.children?.length || 0;
    const max = 9; // Default cap; can change later based on plan

    const btn = document.getElementById('photos-tab-btn');
    if (btn) {
        btn.textContent = `Photos (${count}/${max})`;
    }
}

/**
 * Handles the file upload process when a user selects images.
 * @param {Event} event - The change event from the file input.
 */
async function handleFileUpload(event) {
    const files = Array.from(event.target.files);
    const galleryGrid = document.getElementById('account-galery-grid');
    const user = auth.currentUser;
    if (!user || !galleryGrid) return;

    const userDoc = await db.collection('users').doc(user.uid).get();
    let rawPhotos = userDoc.data()?.photos || [];

    // Filter out any invalid or non-existent photo entries from Firestore
    const validPhotos = [];
    for (const photoData of rawPhotos) {
        // Ensure photoData has a 'url' property before attempting to fetch
        if (photoData && photoData.url) {
            try {
                const res = await fetch(photoData.url, { method: 'HEAD' });
                if (res.ok) {
                    validPhotos.push(photoData); // Keep the whole object if valid
                } else {
                    // If URL is not valid, remove this entry from Firestore
                    await db.collection('users').doc(user.uid).update({
                        photos: firebase.firestore.FieldValue.arrayRemove(photoData)
                    });
                }
            } catch (err) {
                // If fetch fails, treat as invalid and remove from Firestore
                console.error("Error checking photo URL validity:", photoData.url, err);
                await db.collection('users').doc(user.uid).update({
                    photos: firebase.firestore.FieldValue.arrayRemove(photoData)
                });
            }
        }
    }

    const MAX_PHOTOS = 9;
    const remainingSlots = MAX_PHOTOS - validPhotos.length;

    if (remainingSlots <= 0) {
        window.alert("You’ve reached the photo limit. Delete one before uploading new ones.");
        return;
    }

    const allowedFiles = files
        .filter(file => VALID_TYPES.includes(file.type) && file.size <= MAX_SIZE_MB * 1024 * 1024)
        .slice(0, remainingSlots);

    if (allowedFiles.length < files.length) {
        window.alert(`Only ${allowedFiles.length} of your selected files meet the criteria or fit within the limit. You can upload ${remainingSlots} more image(s).`);
    }

    for (const file of allowedFiles) {
        const tempURL = URL.createObjectURL(file);
        const filePath = `users/${user.uid}/photos/${Date.now()}_${file.name}`; // Define filePath here
        const square = createImageSquare(tempURL, filePath, true, true); // Pass filePath during upload
        galleryGrid.appendChild(square);

        try {
            const fileRef = storage.ref(filePath);

            await fileRef.put(file);
            const downloadURL = await fileRef.getDownloadURL();

            square.style.backgroundImage = `url('${downloadURL}')`;
            square.style.opacity = '1';
            square.querySelector('.upload-loader-overlay')?.remove();

            // Store both downloadURL and filePath in Firestore as an object
            const photoData = {
                url: downloadURL,
                path: filePath
            };
            await db.collection('users').doc(user.uid).update({
                photos: firebase.firestore.FieldValue.arrayUnion(photoData)
            });

            updatePhotoCounter();

            // Update the dataset with the final downloadURL and filePath
            square.dataset.downloadUrl = downloadURL;
            square.dataset.filePath = filePath;

        } catch (err) {
            console.error("❌ Upload failed:", err.message);
            square.remove();
        }
    }

    event.target.value = ''; // reset input field
}

/**
 * Initializes the image uploader by attaching the event listener.
 */
export function initAccountGalleryUpload() {
    const input = document.getElementById('account-image-uploader');
    if (input) input.addEventListener('change', handleFileUpload);
}

export { createImageSquare, updatePhotoCounter };