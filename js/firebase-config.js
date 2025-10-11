// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzAjVZzC0IkCzEs9ynCDk1TDfaGRdacC4",
  authDomain: "cardapio-cintia-trufados.firebaseapp.com",
  projectId: "cardapio-cintia-trufados",
  storageBucket: "cardapio-cintia-trufados.firebasestorage.app",
  messagingSenderId: "270826863099",
  appId: "1:270826863099:web:7a031628bdffc82df7735e"
};

// Initialize Firebase using the "compat" version
firebase.initializeApp(firebaseConfig);

// Create a single, shared instance of the Firestore database
const db = firebase.firestore();