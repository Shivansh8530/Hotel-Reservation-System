import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  projectId: "hotel-resevation-8080",
  appId: "1:1032496241536:web:be7da43af9796722437f65",
  storageBucket: "hotel-resevation-8080.firebasestorage.app",
  apiKey: "AIzaSyBFcEJQAAQcLy4kINUkXhwboB1YoEMJxNo",
  authDomain: "hotel-resevation-8080.firebaseapp.com",
  messagingSenderId: "1032496241536",
  measurementId: "G-SXTKCW5JDR"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider)
  const idToken = await result.user.getIdToken()
  return {
    idToken,
    email: result.user.email,
    name: result.user.displayName,
    photoUrl: result.user.photoURL
  }
}

