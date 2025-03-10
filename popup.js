import { getAccessToken } from './auth.js';

// event listeners
document.getElementById('manageToken').addEventListener('click', () => {
    chrome.windows.create({
      url: 'tokenSettings.html',  
      type: 'popup',
      width: 350,
      height: 250
    });
});

document.getElementById('createDocument').addEventListener('click', async () => {
    // Get document title
    const documentName = document.getElementById('documentName').value;

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

    if (response.ok) {
        let doc = await response.json();
        // call the callback function with the document ID as an argument
        if (doc.documentId) {
            callback(doc.documentId);
        } else {
            console.error("Error response from API while creating document:", doc);
            alert(`Error response from API while creating document: ${JSON.stringify(doc)}`);
        }
    } else {
        let errorResponse = await response.json();
        console.error("Error response from API while creating document:", JSON.stringify(errorResponse));
        alert(`Error response from API while creating document: ${JSON.stringify(errorResponse)}`);
    }
}

async function fetchFolders() {
    // promise that resolves with the folders array
    return new Promise((resolve, reject) => {
        getAccessToken(async (token) => {
            if (!token) {
                alert("Authentication failed. Cannot fetch folders.");
                return reject("Authentication failed");
            }

            try {
                const response = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.folder%27&fields=files(id%2Cname)", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (!data.files || data.files.length === 0) {
                    console.warn("No folders found.");
                    return resolve([]);
                }

                console.log("Fetched folders:", data.files);
                resolve(data.files); // Array of {id, name}
            } catch (error) {
                console.error("Error fetching folders:", error);
                reject(error);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const folderInput = document.getElementById('folder-input');
  
    // Fetch folders from Google Drive API once at startup
    const folders = await fetchFolders();
      
    // composed within the other event listener to get access to folders var
    // Runs whenever the user types something in the folder input
    folderInput.addEventListener('input', () => {
        const query = folderInput.value.toLowerCase();
        const suggestionsBox = document.getElementById('suggestions');
        suggestionsBox.innerHTML = '';

        const matches = folders.filter( folder => folder.name.toLowerCase().includes(query) );

        matches.forEach(folder => {
            addSuggestion(folder.name, folder.id);
        });
  
        if (matches.length === 0) {
            addSuggestion('To Be Organized / Needs a Home', 'YOUR_NEEDS_A_HOME_FOLDER_ID')
        }
    });

});

document.getElementById('folder-input').addEventListener('click', () => {
    const suggestionsBox = document.getElementById('suggestions');
    if(suggestionsBox.innerHTML != '') // avoid displaying empty suggestions box
    {
        suggestionsBox.style.display = 'block';
    }
});

document.getElementById('folder-input').addEventListener('blur', () => {
    const suggestionsBox = document.getElementById('suggestions');
    setTimeout(() => { // Delay lets user click on the suggestion before it dissapears
        suggestionsBox.style.display = 'none';
    }, 100); // ms
});

// Adds a suggestion to the suggestions box
function addSuggestion(folderName, folderId) {
    const suggestionsBox = document.getElementById('suggestions');
    const computedStyle = window.getComputedStyle(suggestionsBox);
    if(computedStyle.display === 'none')
    {
        suggestionsBox.style.display = 'block';
    }

    const div = document.createElement('div');
    div.textContent = folderName;
    div.onclick = () => {
        const folderInput = document.getElementById('folder-input');
        folderInput.value = folderName;
        suggestionsBox.innerHTML = '';
        suggestionsBox.style.display = 'none';
        // Store selected folder ID
        selectedFolderId = folderId; // TODO: this isnt being stored anywhere
    };
    suggestionsBox.appendChild(div);
}