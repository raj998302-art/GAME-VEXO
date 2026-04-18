import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkGames() {
  try {
    const snap = await getDocs(collection(db, 'games'));
    console.log(`Found ${snap.size} total games in Firestore.`);
    snap.forEach(doc => {
      console.log(`- ID: ${doc.id} | Title: ${doc.data().title}`);
    });
  } catch(e) {
    console.error("Rules blocked or error:", e);
  }
}

checkGames();
