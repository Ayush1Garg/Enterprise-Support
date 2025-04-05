const docxForm = document.getElementById('docxForm');
const loadingIndicator = document.getElementById('loading');
const AgreementGeneratorBtn = document.getElementById('AgreementGeneratorBtn');

flatpickr("#invoice_date", {
    dateFormat: "d-m-Y",
    defaultDate: new Date(),
    maxDate: new Date()
});

AgreementGeneratorBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const vendorName = document.getElementById('vendorName');
    if (vendorName.value == "") {
        alert("Please select a vendor");
        return;
    }
    const consumer_name = document.getElementById('consumerName');
    const consumer_address = document.getElementById('consumerAddress');
    if (consumer_name.value == "" || consumer_address.value == "") {
        alert("Both Consumer Name and Address Feild are required");
        return;
    }
    document.body.classList.add('loading');
    document.getElementById('loading-overlay').classList.remove('hidden');
    document.getElementById('loading-overlay').classList.add('loading-overlay');
    document.getElementById('spinner').classList.add('loading-spinner');
    fetch('/generateModelAgreement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consumer_name: consumer_name.value, consumer_address: consumer_address.value, vendorName: vendorName.value })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.previewLink) {
                // console.error("❌ No download link received from backend");
                return;
            }

            const docxUrl = data.previewLink;
            const newTab = window.open(docxUrl, "_blank");

            if (newTab) {
                newTab.focus();
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
        });
})

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