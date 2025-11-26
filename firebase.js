import admin from "firebase-admin";
import fs from "fs";

// đọc file JSON
const serviceAccount = JSON.parse(fs.readFileSync("./firebase-service.json", "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "YOUR_PROJECT_ID.appspot.com"
});

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
