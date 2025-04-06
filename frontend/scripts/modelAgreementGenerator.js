const modelAgreementForm = document.getElementById('modelAgreementForm');
// const signedCheckbox = document.getElementById('signed');
// const customerSignInput = document.getElementById('customer_sign');
// const viewFileButton = document.getElementById('viewFile');
// const deleteFileButton = document.getElementById('deleteFile');
// const fileActions = document.getElementById('file-actions');

// signedCheckbox.addEventListener('change', function () {
//     if (this.checked) {
//         customerSignInput.disabled = false;
//     } else {
//         customerSignInput.disabled = true;
//         customerSignInput.value = '';
//         fileActions.style.display = 'none';
//     }
// });

// customerSignInput.addEventListener('change', function () {
//     const file = this.files[0];
//     if (file) {
//         if (file.size > 200 * 1024) {
//             alert('File size must be less than 200KB.');
//             customerSignInput.value = '';
//             fileActions.style.display = 'none';
//             return;
//         }
//         fileActions.style.display = 'block';
//     } else {
//         fileActions.style.display = 'none';
//     }
// });

// deleteFileButton.addEventListener('click', function () {
//     customerSignInput.value = '';
//     fileActions.style.display = 'none';
// });

// viewFileButton.addEventListener('click', function () {
//     const file = customerSignInput.files[0];
//     if (file) {
//         const url = URL.createObjectURL(file);
//         window.open(url, '_blank');
//     }
// });

modelAgreementForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (signedCheckbox.checked) {
        const file = customerSignInput.files[0];
        if (!file) {
            alert("No Signature uploaded. Please Upload valid Sign");
            return;
        }
    }
    document.body.classList.add('loading');
    document.getElementById('loading-overlay').classList.remove('hidden');
    document.getElementById('loading-overlay').classList.add('loading-overlay');
    document.getElementById('spinner').classList.add('loading-spinner');

    const modelAgreementFormData = Object.fromEntries(new FormData(modelAgreementForm));
    console.log(modelAgreementFormData)
    fetch(`${CONFIG.BACKEND_URL}/generateModelAgreement`, {
        method: 'POST',
        body: JSON.stringify(modelAgreementFormData),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            return response.ok ? response.json() : response.text().then(text => { throw new Error(text); });
        })
        .then(data => {
            if (!data.previewLink) {
                alert('Please try again');
                return;
            }

            const docxUrl = data.previewLink;
            const newTab = window.open(docxUrl, "_blank");

            if (newTab) {
                newTab.focus();
            } else {
                alert("Please allow pop-ups to download the Model Agreement.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error generating Model Agreement. Try again.");
        })
        .finally(() => {
            document.body.classList.remove('loading');
            document.getElementById('loading-overlay').classList.add('hidden');
            document.getElementById('loading-overlay').classList.remove('loading-overlay');
            document.getElementById('spinner').classList.remove('loading-spinner');
        });
});