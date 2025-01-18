document.getElementById('createDocument').addEventListener('click', () => {
  // do something to get title
  const documentName = document.getElementById('documentName').textContent;
  if(documentName === "" || documentName === null){
    alert("Please enter a document name");
    return;
  }
  else{
    // createGoogleDoc(documentName, token, documentId => {
    //   // alert(`Created document with ID: ${documentId}`); open it in a new tab... not sure how to do that
    // });
  }
  });


function createGoogleDoc(title, token, callback) {
  const docMetadata = {
    title: title,
  };

  fetch('https://docs.googleapis.com/v1/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(docMetadata)
  })
    .then(response => response.json())
    .then(doc => callback(doc.documentId))
    .catch(error => alert('Error creating document:', error));
}


// function to move to folder.... or just make it in there in the first place?