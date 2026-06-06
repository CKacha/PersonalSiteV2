import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
};

let app: FirebaseApp | null = null;
let _db: Firestore | null = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    _db = getFirestore(app);
}

export const db = new Proxy({} as Firestore, {
    get(_target, prop) {
        if (!_db) {
            throw new Error(
                'Firebase is not configured. Set values in src/lib/firebase.ts before using Firestore.'
            );
        }
        return Reflect.get(_db as object, prop);
    }
});
