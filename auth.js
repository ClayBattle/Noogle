async function authenticate(callback) {
    let raw_json;
    try {
        const response = await fetch(chrome.runtime.getURL('credentials.json'));
        raw_json = await response.json();
    } catch (error) {
        console.error('Error fetching credentials:', error);
        alert(`Error fetching credentials: ${error}`);
        return;
    }

    const CLIENT_ID = raw_json.web.client_id;
    const CLIENT_SECRET = raw_json.web.client_secret;
    /*
        https://www.googleapis.com/auth/drive.metadata.readonly: This scope allows your app to view file and folder metadata, including the ability to list folders, without modifying them.
        https://www.googleapis.com/auth/drive.file: This scope allows your app to view and manage files that it has created or opened with the app. It does not grant access to all files and folders in the user's Google Drive, only those that your app has specifically interacted with.
        https://www.googleapis.com/auth/documents: This scope is specific to Google Docs API and grants access to Google Docs documents. It does not affect the ability to list or manage files and folders on Google Drive.
    */
    const SCOPES = "https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents";
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;

    // Include access_type=offline and prompt=consent in the authorization URL
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;

    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, async (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
            console.error("Authentication failed:", chrome.runtime.lastError?.message);
            alert(`Authentication failed: ${chrome.runtime.lastError?.message}`);
            return;
        }

        // Extract authorization code
        const params = new URLSearchParams(new URL(redirectUrl).search);
        const authorizationCode = params.get("code");

        if (!authorizationCode) {
            console.error("No authorization code found in redirect URL.");
            alert("Failed to retrieve authorization code.");
            return;
        }

        // Exchange code for tokens
        try {
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    code: authorizationCode,
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    redirect_uri: redirectUri,
                    grant_type: 'authorization_code'
                })
            });

            const tokenData = await tokenResponse.json();
            // console.log("Token response:", tokenData); // Log full response for debugging

            const accessToken = tokenData.access_token;
            const refreshToken = tokenData.refresh_token; // TODO: Encrypt this before storing it for better security
            const expiresIn = tokenData.expires_in;
            const expiration_date = Date.now() + expiresIn * 1000;

            if (accessToken) {
                // console.log("Access token retrieved:", accessToken);
                if (refreshToken) {
                    // console.log("Refresh token retrieved:", refreshToken);
                } else {
                    console.warn("No refresh token returned. User may have already authorized the app.");
                }

                chrome.storage.local.set({ accessToken, refreshToken, expiration_date }, () => {
                    console.log("Tokens stored successfully.");
                    if (callback) callback(accessToken);
                });
            } else {
                console.error("No access token in response:", tokenData);
                alert("Failed to retrieve access token.");
            }
        } catch (error) {
            console.error("Error exchanging code for tokens:", error);
            alert(`Token exchange failed: ${error}`);
        }
    });
}

async function getNewAccessToken(refresh_token, callback)
{
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
    const CLIENT_ID = raw_json.web.client_id; // Avoids committing the client ID / secret to the repo
    const CLIENT_SECRET = raw_json.web.client_secret;
    
    try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: refresh_token,
                grant_type: 'refresh_token'
            })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.access_token) {
            const accessToken = tokenData.access_token;
            const expiresIn = tokenData.expires_in; // in seconds
            const expirationDate = Date.now() + expiresIn * 1000; // Convert to milliseconds

            console.log("Access token refreshed.");
            
            // Store the new access token & when it expires
            chrome.storage.local.set({ accessToken, expirationDate }, () => {
                callback(accessToken);
            });
        } else {
            console.error("Failed to refresh access token:", tokenData);
            alert("Failed to refresh access token.");
        }
    } catch (error) {
        console.error("Error refreshing access token:", error);
        alert(`Error refreshing access token: ${error}`);
    }
}

// Get the access token from storage, or authenticate if not found
export async function getAccessToken(callback) {
    chrome.storage.local.get(["accessToken", "expiration_date"], (result) => {
        if (result.accessToken &&  result.expiration_date && Date.now() < result.expiration_date) {
            callback(result.accessToken);
        } 
        else if(result.expiration_date != null && Date.now() >= result.expiration_date)
        {
            chrome.storage.local.get(["refreshToken"], (result) => 
            {
                if(result.refreshToken)
                {
                    getNewAccessToken(result.refreshToken, callback) 
                }
                else // If no refresh token, no choice but to get a new one
                {
                    authenticate(callback);
                }
            });
        }
        else { // user prob hasn't authenticated before
            authenticate(callback);
        }
    });
}