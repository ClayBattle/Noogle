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
    try {
        await getAccessToken(async (token) => {
            if (!token) {
                alert("Authentication failed. Cannot fetch folders.");
                return;
            }

            const response = await fetch("https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.folder%27&fields=files(id%2Cname)",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.files || data.files.length === 0) {
                console.warn("No folders found.");
                return [];
            }
            console.log("Fetched folders:", data.files);
            return data.files; // Array of {id, name}
            
        });
        
    } catch (error) {
        console.error("Error fetching folders:", error);
        return [];
    }
    
}

document.addEventListener('DOMContentLoaded', async () => {
    const folderInput = document.getElementById('folder-input');
    const suggestionsBox = document.getElementById('suggestions');
  
    // Fetch folders from Google Drive API once at startup
    const folders = await fetchFolders();
    console.log("Loaded folders:", folders);
  
    
    // composed within the other event listener to get access to folders var
    folderInput.addEventListener('input', () => {
        const query = folderInput.value.toLowerCase();
        suggestionsBox.innerHTML = '';
        alert(folders)

        const matches = folders.filter(folder => 
        folder.name.toLowerCase().includes(query)
        );

        matches.forEach(folder => {
        const div = document.createElement('div');
        div.textContent = folder.name;
        div.onclick = () => {
            folderInput.value = folder.name;
            suggestionsBox.innerHTML = '';
            // Store selected folder ID
            selectedFolderId = folder.id;
        };
        suggestionsBox.appendChild(div);
        });
  
    //   if (matches.length === 0) {
    //     const div = document.createElement('div');
    //     div.textContent = 'Place in "Needs a Home"';
    //     div.onclick = () => {
    //       folderInput.value = 'To Be Organized / Needs a Home';
    //       suggestionsBox.innerHTML = '';
    //       selectedFolderId = 'YOUR_NEEDS_A_HOME_FOLDER_ID';
    //     };
    //     suggestionsBox.appendChild(div);
    //   }
    });

});