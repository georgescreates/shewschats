const firebaseConfig = {
    apiKey: "AIzaSyDw2sukKSfAqdBFagcBdUdKUs45j_Flx3M",
    authDomain: "shewschats-v0.firebaseapp.com",
    databaseURL: "https://shewschats-v0-default-rtdb.firebaseio.com",
    projectId: "shewschats-v0",
    storageBucket: "shewschats-v0.appspot.com",
    messagingSenderId: "775277519878",
    appId: "1:775277519878:web:19c1f7894f01b1061b0f87",
    measurementId: "G-E35NWH8K07"
};

// Initialize Firebase app if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Export services
const auth = firebase.auth();
const db = firebase.firestore();

// Optional: if you need Storage
const storage = firebase.storage();

export { auth, db, storage };
