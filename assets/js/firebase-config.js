// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAndHb_loxHkdFW_VfmDKTVBEfmF0PC5zQ",
  authDomain: "dubminer-bcd34.firebaseapp.com",
  databaseURL: "https://dubminer-bcd34-default-rtdb.firebaseio.com/",
  projectId: "dubminer-bcd34",
  storageBucket: "dubminer-bcd34.firebasestorage.app",
  messagingSenderId: "561661688484",
  appId: "1:561661688484:web:f431244194aaff2fc18431",
  measurementId: "G-C068ZD7XX8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.database();
const firestore = firebase.firestore();

// Create firebaseApp object for compatibility with existing code
const firebaseApp = {
  auth: auth,
  db: db,
  firestore: firestore
};