/**
 * Formats Firebase Auth error codes into clean, actionable user messages
 * and suppresses benign user-initiated cancellations (like closing the Google popup).
 */
export function formatAuthError(err: unknown): string | null {
  if (!err) return null;

  const errorCode =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code: unknown }).code)
      : '';
  const errorMessage =
    err instanceof Error ? err.message : String(err);

  // Benign popup closure / cancellation by user - do not display as error
  if (
    errorCode === 'auth/popup-closed-by-user' ||
    errorCode === 'auth/cancelled-popup-request' ||
    errorMessage.includes('auth/popup-closed-by-user') ||
    errorMessage.includes('popup-closed-by-user') ||
    errorMessage.includes('cancelled-popup-request')
  ) {
    return null;
  }

  // Popup blocked by browser settings
  if (errorCode === 'auth/popup-blocked' || errorMessage.includes('popup-blocked')) {
    return 'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
  }

  // Network or timeout errors
  if (errorCode === 'auth/network-request-failed') {
    return 'Network connection issue. Please check your internet connection and retry.';
  }

  // Unauthorized domain in Firebase console
  if (errorCode === 'auth/unauthorized-domain' || errorMessage.includes('unauthorized-domain')) {
    return 'This domain is not authorized for Google Sign-In in Firebase Console. Please add it to Firebase Auth settings.';
  }

  // Account exists with different credential
  if (errorCode === 'auth/account-exists-with-different-credential') {
    return 'An account already exists with this email using a different sign-in method.';
  }

  // Generic fallback with clean text
  return errorMessage || 'Authentication encountered an issue. Please try again.';
}
