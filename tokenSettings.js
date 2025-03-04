document.getElementById('resetToken').addEventListener('click', () => {
    chrome.storage.local.clear(() => {
        // Show custom alert
        const alertBox = document.getElementById('alertBox');
        alertBox.style.display = 'block';
    });
});

document.getElementById('closeAlert').addEventListener('click', () => {
    document.getElementById('alertBox').style.display = 'none';
});