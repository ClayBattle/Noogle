// import { authenticate } from "./auth";
document.getElementById('createDocument').addEventListener('click', async () => {
    // do something to get title
    const documentName = document.getElementById('documentName').value;
    alert(`Creating Google Doc with name ${documentName}`);

    if(documentName === "" || documentName === null){
    alert("Please enter a document name");
    return;
    }

    await authenticate((token) => {
    if (!token) {
        alert("Authentication failed.");
        return;
    }

    createGoogleDoc(documentName, token, (docId) => {
        if (docId) {
        alert(`Google Doc created successfully! Document ID: ${docId}`);
        console.log('Created Google Doc with ID:', docId);
        } else {
        alert("Failed to create document.");
        }
    });
    });
});

function createGoogleDoc(title, token, callback) {
    fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
    })
    .then(response => response.json())
    .then(doc => {
        if (doc.documentId) {
        callback(doc.documentId);
        //TODO: OPEN DOC IN NEW TAB
        } else {
        console.error("Error response from API:", doc);
        alert("Error creating document.");
        }
    })
    .catch(error => {
        console.error('Error creating document:', error);
        alert('Error creating document. Check the console for details.');
    });
}

async function authenticate(callback) {
    const response = await fetch(chrome.runtime.getURL('credentials.json'));
    const raw_json = await response.json(); // Parse the JSON asynchronously
    // TODO handle case where no json

    const CLIENT_ID = raw_json.web.client_id;
    const SCOPES = "https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/documents";
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org/`;  // Dynamically gets the extension's ID to open sign in page 
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES)}`;

    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (redirectUrl) => {
        if (chrome.runtime.lastError || !redirectUrl) {
            console.error("Authentication failed:", chrome.runtime.lastError.message);
            alert(`Authentication failed. Please try again. Error: ${chrome.runtime.lastError.message}`);
            return;
        }

        // Extract access token from the redirect URL
        const params = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
        const accessToken = params.get("access_token");

        if (accessToken) {
            console.log("Access token retrieved:", accessToken);
            chrome.storage.local.set({ accessToken }, () => {
                callback(accessToken);
            });
        } else {
            console.error("No access token found.");
            alert("Failed to retrieve access token.");
        }
    });
}

function getAccessToken(callback) {
    chrome.storage.local.get(["accessToken"], (result) => {
        if (result.accessToken) {
            callback(result.accessToken);
        } else {
            authenticate(callback);
        }
    });
}



// function to move to folder.... or just make it in there in the first place?