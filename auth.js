export async function authenticate(callback) {
  // Fetch the credentials.json file from the extension directory
  let raw_json;
  try {
      const response = await fetch(chrome.runtime.getURL('credentials.json'));
      raw_json = await response.json(); 
  } catch (error) {
      console.error('Error fetching credentials from credentials.json: ', error);
      alert(`Error fetching credentials from credentials.json. Did you forget to save your credentials to the Noogle directory? Error: ${error}`);
      return;
  }

  const CLIENT_ID = raw_json.web.client_id; // Avoids committing the client ID to the repo
  const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents";
  const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;  // Dynamically gets the extension's ID to open sign in page 
  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES)}`;

  chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (redirectUrl) => {
      if (chrome.runtime.lastError || !redirectUrl) {
          console.error("Authentication failed:", chrome.runtime.lastError.message);
          alert(`Authentication failed. Error: ${chrome.runtime.lastError.message}`);
          return;
      }

      // Extract access token from the redirect URL
      // .hash extracts part of url which comes after the # symbol. We remove the # with the .substring call
      const params = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
      const accessToken = params.get("access_token");

      if (accessToken) {
          console.log("Access token retrieved.");
          chrome.storage.local.set({ accessToken }, () => { // save token so we don't need to keep authenticating.
              callback(accessToken);
          });
      } else {
          console.error("Failed to retrieve access token from authentication URL.");
          alert("Failed to retrieve access token from authentication URL.");
      }
  });
}

// Get the access token from storage, or authenticate if not found
export async function getAccessToken(callback) {
  //TODO, handle when access token expires?
  chrome.storage.local.get(["accessToken"], (result) => {
      if (result.accessToken) {
          callback(result.accessToken);
      } else {
          authenticate(callback);
      }
  });
}