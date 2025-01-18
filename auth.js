// const CLIENT_ID assumed defined in credentials.js
// const API_KEY assumed defined in credentials.js
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents';


//TODO: test
function authenticate(callback) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
    if (chrome.runtime.lastError || !token) {
      console.error('Authentication failed');
      return;
    }
    callback(token);
  });
}
