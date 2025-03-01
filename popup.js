import { getAccessToken } from './auth.js';


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


// function to move to folder.... or just make it in there in the first place?