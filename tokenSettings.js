// Updates custom alert text
function updateAlertText(newText1, newText2="") {
    const alertBox = document.getElementById('alertBox');
    const paragraphs = alertBox.getElementsByTagName('p');
  
    // Update the first paragraph
    if (paragraphs[0]) {
      paragraphs[0].textContent = newText1; 
    }
  
    // Update the second paragraph
    if (paragraphs[1]) {
      paragraphs[1].textContent = newText2; 
    }
}

function showAlert(newText1, newText2="") {
    const alertBox = document.getElementById('alertBox');
    updateAlertText(newText1, newText2);
    alertBox.style.display = 'block';
}

document.getElementById('closeAlert').addEventListener('click', () => {
    document.getElementById('alertBox').style.display = 'none';
});

document.getElementById('importToken').addEventListener('click', () => {
    const token = document.getElementById('tokenImport');
    if(token.value)
    {
        // sanitize token
        const token_val  = token.value.trim();
        if(!token_val.startsWith("1//") || token_val.length <= 50)
        {
            showAlert('Invalid token.', 'Please provide a valid token.');
            token.value = '';
            return;
        }
        chrome.storage.local.set({ refreshToken: token_val, expiration_date: new Date(0).getSeconds() }, () => {
            showAlert('Token imported.', 'You can now make new documents!');
            token.value = '';
        });
    }
    else
    {
        showAlert('Please type/paste a token to import.');
    }
});


document.getElementById('resetToken').addEventListener('click', () => {
    chrome.storage.local.clear(() => {
        showAlert('Token reset.', 'Please re-authenticate.');
    });
});


document.getElementById('exportToken').addEventListener('click', () => {
    chrome.storage.local.get(["refreshToken"], (result) => {
        if(result.refreshToken)
        {
            const data = new ClipboardItem({ "text/plain": result.refreshToken });
            navigator.clipboard.write([data]);
            showAlert('Refresh token copied to clipboard:', `${result.refreshToken}`);
        }
        else // If no refresh token, no choice but to get a new one
        {
            showAlert('There exists no refresh token to copy.');
        }
    });
});

