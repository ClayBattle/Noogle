// import { authenticate } from "./auth";
document.getElementById('createDocument').addEventListener('click', async () => {
    // Get document title
    const documentName = document.getElementById('documentName').value;
    alert(`Creating Google Doc with name ${documentName}`); //TODO: REMOVE THIS LINE when done testing

    if(documentName === "" || documentName === null){
        alert("Please enter a document name");
        return;
    }

    // Get auth token, then create a doc using it. 
    // The argument to the getAccessToken function is a callback function that will be called with the token as an argument.
    getAccessToken((token) => {
        if (!token) {
            alert("Authentication failed.");
            return;
        }
        // third arg is the callback that runs once the document is created
        createGoogleDoc(documentName, token, (docId) => {
            if (docId) {
                const docUrl = `https://docs.google.com/document/d/${docId}`;
                console.log(`Google Doc created successfully! Document URL: ${docUrl}`);
                window.open(docUrl, '_blank'); // "_blank" opens the URL in a new tab
            } else {
                alert("Failed to create document.");
            }
        });
    });
});

async function createGoogleDoc(title, token, callback) {
    // Create a new Google Doc with the given title
    let response = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title })
    })
    let doc = await response.json() 
    // call the callback function with the document ID as an argument
    if (doc.documentId) {
        callback(doc.documentId);
    } else {
        console.error("Error response from API while creating document:", doc);
        alert("Error response from API while creating document:", doc);
    }
}

async function authenticate(callback) {
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
async function getAccessToken(callback) {
    //TODO, handle when access token expires?
    chrome.storage.local.get(["accessToken"], (result) => {
        if (result.accessToken) {
            callback(result.accessToken);
        } else {
            authenticate(callback);
        }
    });
}



// function to move to folder.... or just make it in there in the first place?