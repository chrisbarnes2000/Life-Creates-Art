
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
let isSigningIn = false;

export function initiateAnonymousSignIn(authInstance: Auth): void {
  // If already signed in or in the process, skip to avoid "spam" in console/logs
  if (authInstance.currentUser || isSigningIn) return;

  isSigningIn = true;
  signInAnonymously(authInstance)
    .then((result) => {
      // Store in localStorage if needed for debugging/persistence confirmation
      if (typeof window !== 'undefined') {
        localStorage.setItem('firebase_anon_identity', result.user.uid);
      }
    })
    .catch((error) => {
      if (error.code === 'auth/admin-restricted-operation') {
        console.error(
          'Anonymous sign-in is disabled in the Firebase Console. ' +
          'Please enable it at: https://console.firebase.google.com/project/_/authentication/providers'
        );
      } else {
        console.error('Anonymous sign-in error:', error);
      }
    })
    .finally(() => {
      isSigningIn = false;
    });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error('Email sign-up error:', error);
    // Background errors are caught; real-time form errors should be handled in components.
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error) => {
    console.error('Email sign-in error:', error);
    // Background errors are caught.
  });
}
