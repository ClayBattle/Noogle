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


document.getElementById('importToken').addEventListener('click', () => {
    document.getElementById('alertBox').style.display = 'none';
});


document.getElementById('resetToken').addEventListener('click', () => {
    chrome.storage.local.clear(() => {
        // Show custom alert
        const alertBox = document.getElementById('alertBox');
        updateAlertText('Token reset.', 'Please re-authenticate.');

        alertBox.style.display = 'block';
    });
});


document.getElementById('exportToken').addEventListener('click', () => {
    chrome.storage.local.get(["refreshToken"], (result) => {
        if(result.refreshToken)
        {
            const data = new ClipboardItem({ "text/plain": result.refreshToken });
            navigator.clipboard.write([data]);
            const alertBox = document.getElementById('alertBox');
            updateAlertText('Refresh token copied to clipboard:', `${result.refreshToken}`);
            alertBox.style.display = 'block';
        }
        else // If no refresh token, no choice but to get a new one
        {
            const alertBox = document.getElementById('alertBox');
            updateAlertText('There exists no refresh token to copy.');
            alertBox.style.display = 'block';
        }
    });
});

document.getElementById('closeAlert').addEventListener('click', () => {
    document.getElementById('alertBox').style.display = 'none';
});