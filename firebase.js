import admin from "firebase-admin";
import serviceAccount from "./firebase-service.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "YOUR_PROJECT_ID.appspot.com"
});

export const db = admin.firestore();
export const bucket = admin.storage().bucket();
