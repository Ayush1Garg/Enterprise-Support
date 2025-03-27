const docxForm = document.getElementById('docxForm');
const loadingIndicator = document.getElementById('loading');

flatpickr("#invoice_date", {
    dateFormat: "d-m-Y",
    defaultDate: new Date(),
    maxDate: new Date()
});

docxForm.addEventListener('submit', function (event) {
    event.preventDefault();

    document.body.classList.add('loading');
    document.getElementById('loading-overlay').classList.remove('hidden');
    document.getElementById('loading-overlay').classList.add('loading-overlay');
    document.getElementById('spinner').classList.add('loading-spinner');

    const docxFormData = Object.fromEntries(new FormData(docxForm));
    let serialsArray = docxFormData.serial_numbers.split(',').map(s => s.trim());
    docxFormData.serial_numbers = serialsArray;
    if (serialsArray.length != Number(docxFormData.no_of_panels)) {
        document.body.classList.remove('loading');
        document.getElementById('loading-overlay').classList.add('hidden');
        document.getElementById('loading-overlay').classList.remove('loading-overlay');
        document.getElementById('spinner').classList.remove('loading-spinner');
        if (serialsArray.length > Number(docxFormData.no_of_panels)) {
            alert("Error: Number of serial numbers is more the number of panels");
        }
        else {
            alert("Error: Number of serial numbers is less than the number of panels");
        }
        return;
    }
    fetch(`${CONFIG.BACKEND_URL}/generate-file`, {
        method: 'POST',
        body: JSON.stringify(docxFormData),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => {
            return response.ok ? response.json() : response.text().then(text => { throw new Error(text); });
        })
        .then(data => {
            if (!data.previewLink) {
                // console.error("❌ No download link received from backend");
                return;
            }

            const docxUrl = data.previewLink;
            const newTab = window.open(docxUrl, "_blank");

            if (newTab) {
                newTab.focus();
                //reset form
            } else {
                alert("Please allow pop-ups to preview the Document.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Error generating Document. Try again.");
        })
        .finally(() => {
            document.body.classList.remove('loading');
            document.getElementById('loading-overlay').classList.add('hidden');
            document.getElementById('loading-overlay').classList.remove('loading-overlay');
            document.getElementById('spinner').classList.remove('loading-spinner');
            // console.log(`${CONFIG.BACKEND_URL}/generate-file`);
        });
});