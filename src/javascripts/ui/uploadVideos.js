import { db, storage, auth } from '../data/firebaseConfig.js';

const MAX_MB = 30;
const MAX_BYTES = MAX_MB * 1024 * 1024;
const VALID_TYPES = ['video/mp4'];
const MAX_VIDEOS = 9;

export function appendVideoSquareToGrid(wrapper) {
    const grid = document.getElementById('account-videos-grid');
    if (!grid || !wrapper) return;

    let rows = grid.querySelectorAll('.videos-row');
    let lastRow = rows[rows.length - 1];

    if (!lastRow || lastRow.children.length >= 3) {
        lastRow = document.createElement('div');
        lastRow.className = 'videos-row flex flex-row gap-1 w-full';
        grid.appendChild(lastRow);
    }

    lastRow.appendChild(wrapper);
}

export async function handleVideoUpload(event) {
    const user = auth.currentUser;
    if (!user) return;

    const input = event.target;
    const files = Array.from(input.files);
    if (!files.length) return;

    const userDoc = await db.collection('users').doc(user.uid).get();
    const data = userDoc.data();
    const existing = Array.isArray(data?.videos) ? data.videos : [];
    const videoLimits = data?.accountTiers?.max?.videos || { count: 6, singleStorage: 30720, singleDuration: 120 };
    const MAX_BYTES = videoLimits.singleStorage * 1024;
    const remaining = videoLimits.count - existing.length;

    const allowedFiles = files.filter(file => {
        return file.type === 'video/mp4' && file.size <= MAX_BYTES;
    }).slice(0, remaining);

    if (!allowedFiles.length) {
        alert(`Upload blocked: max ${videoLimits.count} files, ${videoLimits.singleStorage}KB each.`);
        return;
    }

    for (const file of allowedFiles) {
        const tempURL = URL.createObjectURL(file);
        const filePath = `users/${user.uid}/videos/${Date.now()}_${file.name}`;

        // Setup DOM elements
        const wrapper = document.createElement('div');
        wrapper.className = 'video-square aspect-[9/16] w-[calc(100%/3)] h-auto rounded-sm relative overflow-hidden bg-white';

        const video = document.createElement('video');
        video.src = tempURL;
        video.controls = true;
        video.className = 'w-full h-full object-cover';
        video.style.opacity = '0.5';

        const overlay = document.createElement('div');
        overlay.className = 'upload-loader-overlay absolute inset-0 bg-white opacity-70 flex items-center justify-center z-20';
        const spinner = document.querySelector('#loading-window svg');
        overlay.innerHTML = spinner?.outerHTML || 'Uploading...';

        wrapper.appendChild(video);
        wrapper.appendChild(overlay);

        appendVideoSquareToGrid(wrapper);

        try {
            const duration = await new Promise(resolve => {
                const probe = document.createElement('video');
                probe.preload = 'metadata';
                probe.src = tempURL;
                probe.onloadedmetadata = () => resolve(probe.duration);
            });

            const fileRef = storage.ref(filePath);
            await fileRef.put(file);
            const downloadURL = await fileRef.getDownloadURL();

            const videoData = {
                url: downloadURL,
                path: filePath,
                addedAt: firebase.firestore.Timestamp.now(),
                fileSize: file.size,
                fileDuration: Math.round(duration)
            };

            wrapper.dataset.size = videoData.fileSize;
            wrapper.dataset.duration = videoData.fileDuration;

            await db.collection('users').doc(user.uid).update({
                videos: firebase.firestore.FieldValue.arrayUnion(videoData)
            });

            video.src = downloadURL;
            video.style.opacity = '1';
            overlay.remove();

            // Create delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M7.616 20q-.667 0-1.141-.475T6 18.386V6h-.5q-.213 0-.356-.144T5 5.499t.144-.356T5.5 5H9q0-.31.23-.54t.54-.23h4.46q.31 0 .54.23T15 5h3.5q.213 0 .356.144t.144.357t-.144.356T18.5 6H18v12.385q0 .666-.475 1.14t-1.14.475zM17 6H7v12.385q0 .269.173.442t.443.173h8.769q.269 0 .442-.173t.173-.442zm-6.692 11q.213 0 .357-.144t.143-.356v-8q0-.213-.144-.356T10.307 8t-.356.144t-.143.356v8q0 .213.144.356q.144.144.356.144m3.385 0q.213 0 .356-.144t.143-.356v-8q0-.213-.144-.356Q13.904 8 13.692 8q-.213 0-.357.144t-.143.356v8q0 .213.144.356t.357.144M7 6v13z" stroke-width="0.25" stroke="currentColor" /></svg>';
            deleteBtn.className = 'absolute top-1 right-1 bg-red-500 text-white p-1 rounded z-30 cursor-pointer';
            wrapper.appendChild(deleteBtn);
            deleteBtn.addEventListener('click', () => deleteVideo(videoData, wrapper, videoLimits));

            reflowVideoGrid();

            const squares = Array.from(document.querySelectorAll('.video-square'));
            const currentVideos = squares.map(square => ({
                fileSize: parseInt(square.dataset.size || '0'),
                fileDuration: parseInt(square.dataset.duration || '0')
            }));

            updateVideoInfoDisplay(currentVideos, videoLimits);
        } catch (err) {
            console.error('❌ Upload failed:', err.message);
            alert(`Upload failed for ${file.name}`);
            overlay.innerHTML = '<span class="text-red-600 font-semibold">Upload failed</span>';
            video.style.opacity = '0.3';
            setTimeout(() => wrapper.remove(), 4000); // Clean up broken video block
        }
    }

    input.value = '';
}

export function initVideoUpload() {
    const input = document.getElementById('account-videos-uploader');
    if (input) {
        input.addEventListener('change', handleVideoUpload);
    }
}

export function reflowVideoGrid() {
    const grid = document.getElementById('account-videos-grid');
    if (!grid) return;

    const squares = Array.from(grid.querySelectorAll('.video-square'));
    grid.innerHTML = ''; // Clear all rows

    let row;
    squares.forEach((square, index) => {
        if (index % 3 === 0) {
            row = document.createElement('div');
            row.className = 'videos-row flex flex-row gap-1 w-full';
            grid.appendChild(row);
        }
        row.appendChild(square);
    });
}

/**
 * Displays the user's uploaded videos from Firestore.
 * @param {Array<Object>} videos - List of video objects to render.
 */
export function displayUserVideos(videos = [], videoLimits = { count: 6, singleStorage: 30720 }) {
    const grid = document.getElementById('account-videos-grid');
    const countInfo = document.getElementById('videos-count-info');
    const maxInfo = document.getElementById('videos-count-info-max');

    if (!grid || !countInfo || !maxInfo) return;

    grid.innerHTML = '';

    const MAX = 9;
    countInfo.textContent = videos.length;
    maxInfo.textContent = `out of ${MAX}`;

    videos.forEach(videoData => {
        if (!videoData?.url) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'video-square aspect-[9/16] w-[calc(100%/3)] h-auto rounded-sm relative overflow-hidden bg-white';
        wrapper.dataset.size = videoData.fileSize || 0;
        wrapper.dataset.duration = videoData.fileDuration || 0;

        const video = document.createElement('video');
        video.src = videoData.url;
        video.controls = true;
        video.className = 'w-full h-full object-cover';

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7.616 20q-.667 0-1.141-.475T6 18.386V6h-.5q-.213 0-.356-.144T5 5.499t.144-.356T5.5 5H9q0-.31.23-.54t.54-.23h4.46q.31 0 .54.23T15 5h3.5q.213 0 .356.144t.144.357t-.144.356T18.5 6H18v12.385q0 .666-.475 1.14t-1.14.475zM17 6H7v12.385q0 .269.173.442t.443.173h8.769q.269 0 .442-.173t.173-.442zm-6.692 11q.213 0 .357-.144t.143-.356v-8q0-.213-.144-.356T10.307 8t-.356.144t-.143.356v8q0 .213.144.356q.144.144.356.144m3.385 0q.213 0 .356-.144t.143-.356v-8q0-.213-.144-.356Q13.904 8 13.692 8q-.213 0-.357.144t-.143.356v8q0 .213.144.356t.357.144M7 6v13z" />
        </svg>`;
        deleteBtn.title = 'Delete';
        deleteBtn.className = 'absolute top-1 right-1 bg-cinnabar-600 text-cinnabar-50 rounded-sm p-1 text-xs z-30 hover:bg-cinnabar-700 cursor-pointer';

        deleteBtn.addEventListener('click', () => deleteVideo(videoData, wrapper, videoLimits));

        wrapper.appendChild(video);
        wrapper.appendChild(deleteBtn);
        appendVideoSquareToGrid(wrapper);
        updateVideoInfoDisplay(videos, videoLimits);
    });
}

export async function deleteVideo(videoData, wrapper, videoLimits) {
    const confirmed = window.confirm("Delete this video?");
    if (!confirmed) return;

    const deleteBtn = wrapper.querySelector('button');
    if (deleteBtn) {
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
            <circle cx="4" cy="12" r="3" fill="currentColor">
                <animate attributeName="r" begin="0s" dur="0.75s" values="3;.2;3" repeatCount="indefinite" />
            </circle>
            <circle cx="12" cy="12" r="3" fill="currentColor">
                <animate attributeName="r" begin="0.15s" dur="0.75s" values="3;.2;3" repeatCount="indefinite" />
            </circle>
            <circle cx="20" cy="12" r="3" fill="currentColor">
                <animate attributeName="r" begin="0.3s" dur="0.75s" values="3;.2;3" repeatCount="indefinite" />
            </circle>
        </svg>`;
    }

    try {
        const fileRef = storage.ref(videoData.path);
        await fileRef.delete();

        await db.collection('users').doc(auth.currentUser.uid).update({
            videos: firebase.firestore.FieldValue.arrayRemove(videoData)
        });

        wrapper.remove();
        reflowVideoGrid();

        // Recalculate updated video list from DOM
        const squares = Array.from(document.querySelectorAll('.video-square'));
        const remainingVideos = squares.map(square => ({
            fileSize: parseInt(square.dataset.size || '0'),
            fileDuration: parseInt(square.dataset.duration || '0')
        }));

        updateVideoInfoDisplay(remainingVideos, videoLimits);
    } catch (err) {
        console.error("❌ Failed to delete video:", err.message);
        alert("Couldn't delete this video. Try again.");
        if (deleteBtn) {
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = '❌';
        }
    }
}

function formatDuration(seconds) {
    // const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export function updateVideoInfoDisplay(videos = [], limits = { count: 6, singleStorage: 30720 }) {
    const countInfo = document.getElementById('videos-count-info');
    const countInfoMax = document.getElementById('videos-count-info-max');
    const sizeInfo = document.getElementById('videos-subtotal-info');
    const sizeInfoMax = document.getElementById('videos-subtotal-info-max');
    const durationInfo = document.getElementById('videos-duration-info');
    const durationInfoMax = document.getElementById('videos-duration-info-max');

    const count = videos.length;
    const totalBytes = videos.reduce((sum, v) => sum + (v.fileSize || 0), 0);
    const totalMB = (totalBytes / 1024 / 1024).toFixed(1);
    const maxMB = (limits.count * limits.singleStorage / 1024).toFixed(1);
    const totalDuration = videos.reduce((sum, d) => sum + (d.fileDuration || 0), 0);
    const totalDurationMax = limits.count * limits.singleDuration;

    if (countInfo) countInfo.textContent = `${count} video(s)`;
    if (countInfoMax) countInfoMax.textContent = `out of ${limits.count}`;
    if (sizeInfo) sizeInfo.textContent = `${totalMB} MB`;
    if (sizeInfoMax) sizeInfoMax.textContent = `out of ${maxMB} MB`;
    if (durationInfo) durationInfo.textContent = formatDuration(totalDuration) + ' watchtime';
    if (durationInfoMax) durationInfoMax.textContent = `out of ${formatDuration(totalDurationMax)}`;
}

