// Camera recorder module for desktop browsers
// Exposes setupCameraRecorder() to be called from main.js

import { handleVideoUpload } from '../ui/uploadVideos.js';

export function setupCameraRecorder() {
    let mediaStream;
    let mediaRecorder;
    let recordedChunks = [];

    const wrapper = document.getElementById('desktop-recorder-wrapper');
    const preview = document.getElementById('live-preview');
    const startBtn = document.getElementById('start-recording-btn');
    const stopBtn = document.getElementById('stop-recording-btn');
    const openBtn = document.getElementById('open-record-camera-btn');

    if (!wrapper || !preview || !startBtn || !stopBtn || !openBtn) return;

    openBtn.addEventListener('click', async () => {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            preview.srcObject = mediaStream;
            wrapper.classList.remove('hidden');
        } catch (err) {
            alert('Camera access was denied or not supported.');
            console.error(err);
        }
    });

    startBtn.addEventListener('click', () => {
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm' });

        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const file = new File([blob], `recorded-${Date.now()}.webm`, { type: 'video/webm' });

            // Convert file to pseudo input for handleVideoUpload
            const dt = new DataTransfer();
            dt.items.add(file);
            const input = document.createElement('input');
            input.type = 'file';
            input.files = dt.files;
            handleVideoUpload({ target: input });
        };

        mediaRecorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    });

    stopBtn.addEventListener('click', () => {
        mediaRecorder.stop();
        mediaStream.getTracks().forEach(track => track.stop());
        preview.srcObject = null;
        wrapper.classList.add('hidden');
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });
} 
