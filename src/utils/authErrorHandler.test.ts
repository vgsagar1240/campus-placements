// Test file to demonstrate Firebase error handling
// This is for documentation purposes only

import { getAuthErrorMessage, extractFirebaseErrorCode } from './authErrorHandler';

// Example test cases for error handling
const testErrorHandling = () => {
  // Test case 1: User not found
  const userNotFoundError = {
    code: 'auth/user-not-found',
    message: 'Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found).'
  };
  
  console.log('User not found error:', getAuthErrorMessage(userNotFoundError));
  // Output: "User not found. Please check your email address."
  
  // Test case 2: Wrong password
  const wrongPasswordError = {
    code: 'auth/wrong-password',
    message: 'Firebase: The password is invalid or the user does not have a password. (auth/wrong-password).'
  };
  
  console.log('Wrong password error:', getAuthErrorMessage(wrongPasswordError));
  // Output: "Incorrect password. Please try again."
  
  // Test case 3: Invalid credentials (newer Firebase versions)
  const invalidCredentialError = {
    code: 'auth/invalid-login-credentials',
    message: 'Firebase: The supplied auth credential is incorrect, malformed or has expired. (auth/invalid-login-credentials).'
  };
  
  console.log('Invalid credentials error:', getAuthErrorMessage(invalidCredentialError));
  // Output: "Invalid email or password. Please check your credentials."
  
  // Test case 4: Network error
  const networkError = {
    code: 'auth/network-request-failed',
    message: 'Firebase: A network error (such as timeout, interrupted connection or unreachable host) has occurred. (auth/network-request-failed).'
  };
  
  console.log('Network error:', getAuthErrorMessage(networkError));
  // Output: "Network error. Please check your internet connection."
  
  // Test case 5: Unknown error
  const unknownError = {
    code: 'auth/unknown-error',
    message: 'Some unknown Firebase error'
  };
  
  console.log('Unknown error:', getAuthErrorMessage(unknownError));
  // Output: "An error occurred during authentication. Please try again."
};

// Test error code extraction
const testErrorCodeExtraction = () => {
  // Test direct code
  const errorWithCode = { code: 'auth/user-not-found' };
  console.log('Extracted code:', extractFirebaseErrorCode(errorWithCode));
  // Output: "auth/user-not-found"
  
  // Test code from message
  const errorWithMessage = { 
    message: 'Firebase: There is no user record corresponding to this identifier. (auth/user-not-found).' 
  };
  console.log('Extracted code from message:', extractFirebaseErrorCode(errorWithMessage));
  // Output: "auth/user-not-found"
  
  // Test unknown error
  const unknownError = { message: 'Some random error' };
  console.log('Unknown error code:', extractFirebaseErrorCode(unknownError));
  // Output: "unknown"
};

export { testErrorHandling, testErrorCodeExtraction };
