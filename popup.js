import { getAccessToken } from './auth.js';

let selectedFolder = {id: null, name: "Root"};

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
    const url = 'https://www.googleapis.com/drive/v3/files';
    
    const metadata = {
        name: title,
        mimeType: 'application/vnd.google-apps.document',
        parents: [selectedFolder.id] // if this is null, doc will be created in root dir 
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
    });

    if (response.ok) {
        let doc = await response.json();
        // call the callback function with the document ID as an argument (Opens a new tab with that document)
        if (doc.id) {
            callback(doc.id);
        } else {
            console.error("Error response from API while creating document:", JSON.stringify(doc));
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
    // This is folder name dependant. Find a way to make things not break if this changes?
    const defaultFolder = folders.find(folder => folder.name === 'To Be Organized / Needs a Home'); 
      
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
  
        // always suggest the default folder and root directory if nothing else matches
        if (matches.length === 0) {
            addSuggestion(defaultFolder.name, defaultFolder.id)
            addSuggestion('Root', null) // Root Directory
        }
        else if(matches.length === 1){
            updateSelectedFolder(matches[0].name, matches[0].id);
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
    }, 100); // in ms
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
        updateSelectedFolder(folderName, folderId);
    };
    suggestionsBox.appendChild(div);
}

// Updates UI and internally stores ID and name of the selected folder
function updateSelectedFolder(folderName, folderId){
    selectedFolder.id = folderId;
    selectedFolder.name = folderName;
    const selectedFolderText = document.getElementById('selectedFolderText');
    selectedFolderText.textContent = folderName;
}