const quotationForm = document.getElementById("QuotationForm");
const vendorSelect = document.getElementById("vendorSelect");
const quotationFormBody = document.getElementById("quotationFormBody");
const NDspecificFields = document.getElementById("ND-specific-fields");
const MamtaSpecificFields = document.getElementById("Mamta-specific-fields");

vendorSelect.addEventListener("change", function() {
    const selected = vendorSelect.value;
    if (selected == ""){
        quotationFormBody.classList.add("removed");
    }
    else{
        quotationFormBody.classList.remove("removed");
        if(selected == "ND Techno Solutions"){
            NDspecificFields.classList.remove("removed");
            MamtaSpecificFields.classList.add("removed");
        }else if(selected =="Mamta Enterprises"){
            MamtaSpecificFields.classList.add("removed");
            NDspecificFields.classList.add("removed");
        }else{
            NDspecificFields.classList.add("removed");
            MamtaSpecificFields.classList.add("removed");
        }
    }
});

quotationForm.onsubmit = async (e) => {
    e.preventDefault();
    const quotationFormData = Object.fromEntries(new FormData(quotationForm));
    console.log(quotationFormData);
    const validData =  validateForm(quotationFormData);
    if (!validData) {
        return;
    }
    document.body.classList.remove('loading');
    document.getElementById('loading-overlay').classList.add('hidden');
    document.getElementById('loading-overlay').classList.remove('loading-overlay');
    document.getElementById('spinner').classList.remove('loading-spinner');
    fetch(`${CONFIG.BACKEND_URL}/generateQuotation`,{
        method: 'POST',
        body: JSON.Stringify(quotationFormData),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response=>{
        if (response.ok) {
            return response.ok ? response.json() : response.text().then(text => { throw new Error(text); });
        }
    }).then(data => {
        if (!data.previewLink) {
            return;
        }

        const docxUrl = data.previewLink;
        const newTab = window.open(docxUrl, "_blank");

        if (newTab) {
            newTab.focus();
        } else {
            alert("Please allow pop-ups to preview the Document.");
        }
    }).catch(error => {
        console.error('Error:', error);
        alert("Error generating Document. Try again.");
    }).finally(() => {
        document.body.classList.remove('loading');
        document.getElementById('loading-overlay').classList.add('hidden');
        document.getElementById('loading-overlay').classList.remove('loading-overlay');
        document.getElementById('spinner').classList.remove('loading-spinner');
    });
}

const validateForm = () => {
    return true;
}

// const populatePanelBrands = async(select) =>{
//     const currVal = select.value;
//     const panelBrandsList = await getTableData('/allPanelBrands')
//     select.innerHTML = `<option value="" disabled>-- Select a Panel Brand</option>`;
//     panelBrandsList.forEach(brand => {
//         select.append(`<option value="${brand.panelBrand}">${brand.panelBrand}</option>`);
//         if(currVal == brand.panelBrand){
//             select.value = currVal;
//         }
//     })
// }
//
// const populateInverterBrands = async(select) =>{
//     const currVal = select.value;
//     const inverterBrandsList = await getTableData('/allInverterBrands');
//     select.innerHTML = `<option value="" disabled>-- Select an Inverter Brand</option>`;
//     inverterBrandsList.forEach(brand => {
//         select.append(`<option value="${brand}">${brand}</option>`);
//         if(currVal == brand){
//             select.value = currVal;
//         }
//     })
// }

