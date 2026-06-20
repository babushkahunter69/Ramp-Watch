import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBlPPF2U6S2RKEPyTeic5dTxKuF5VOrkl8",
  authDomain: "ramp-watch.firebaseapp.com",
  projectId: "ramp-watch",
  storageBucket: "ramp-watch.firebasestorage.app",
  messagingSenderId: "824938802037",
  appId: "1:824938802037:web:021817e1aaf5054402413c",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Ensures every visitor has an anonymous uid before they can write data.
// Resolves with the uid once signed in.
export function ensureAnonAuth() {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          unsub();
          resolve(user.uid);
        } else {
          signInAnonymously(auth).catch(reject);
        }
      },
      reject
    );
  });
}
