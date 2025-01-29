import { CLIENT_ID } from "./credentials";
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents';

export function authenticate(callback) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError || !token) {
      console.error('Authentication failed:', chrome.runtime.lastError);
      return;
    }
    callback(token);
  });
}

export function revokeToken(token) {
  chrome.identity.removeCachedAuthToken({ token }, () => {
    console.log('Token revoked');
  });
}