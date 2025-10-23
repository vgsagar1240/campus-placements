// Firebase authentication error handler utility
export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    // Authentication errors
    case 'auth/user-not-found':
      return 'User not found. Please check your email address.';
    
    case 'auth/wrong-password':
      return 'The current password you entered is incorrect. Please check and try again.';
    
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled.';
    
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    
    case 'auth/invalid-credential':
      return 'The current password is incorrect. Please verify your credentials and try again.';
    
    case 'auth/invalid-login-credentials':
      return 'The current password is incorrect. Please verify your credentials and try again.';
    
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    
    case 'auth/credential-already-in-use':
      return 'This credential is already associated with a different user account.';
    
    case 'auth/invalid-verification-code':
      return 'Invalid verification code. Please try again.';
    
    case 'auth/invalid-verification-id':
      return 'Invalid verification ID. Please try again.';
    
    case 'auth/missing-verification-code':
      return 'Verification code is required.';
    
    case 'auth/missing-verification-id':
      return 'Verification ID is required.';
    
    case 'auth/quota-exceeded':
      return 'Service quota exceeded. Please try again later.';
    
    case 'auth/captcha-check-failed':
      return 'CAPTCHA verification failed. Please try again.';
    
    case 'auth/invalid-phone-number':
      return 'Invalid phone number format.';
    
    case 'auth/missing-phone-number':
      return 'Phone number is required.';
    
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    
    case 'auth/requires-recent-login':
      return 'This operation requires recent authentication. Please log in again.';
    
    case 'auth/timeout':
      return 'Request timed out. Please try again.';
    
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for this operation.';
    
    case 'auth/user-token-expired':
      return 'Your session has expired. Please log in again.';
    
    case 'auth/web-storage-unsupported':
      return 'Web storage is not supported in this browser.';
    
    case 'auth/app-deleted':
      return 'The Firebase app has been deleted.';
    
    case 'auth/app-not-authorized':
      return 'This app is not authorized to use Firebase Authentication.';
    
    case 'auth/argument-error':
      return 'Invalid argument provided. Please check your input.';
    
    case 'auth/invalid-api-key':
      return 'Invalid API key. Please contact support.';
    
    case 'auth/invalid-user-token':
      return 'Invalid user token. Please log in again.';
    
    case 'auth/null-user':
      return 'No user is currently signed in.';
    
    case 'auth/operation-not-allowed':
      return 'This operation is not allowed.';
    
    case 'auth/provider-already-linked':
      return 'This provider is already linked to your account.';
    
    case 'auth/no-such-provider':
      return 'No such provider exists.';
    
    // Generic fallback
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};

// Helper function to extract error code from Firebase error
export const extractFirebaseErrorCode = (error: any): string => {
  if (error?.code) {
    return error.code;
  }
  
  if (error?.message) {
    // Try to extract error code from message
    const match = error.message.match(/auth\/([a-z-]+)/);
    if (match) {
      return `auth/${match[1]}`;
    }
  }
  
  return 'unknown';
};

// Main function to get user-friendly error message
export const getAuthErrorMessage = (error: any): string => {
  const errorCode = extractFirebaseErrorCode(error);
  return getFirebaseErrorMessage(errorCode);
};
