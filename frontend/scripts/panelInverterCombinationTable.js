const panelInverterCombinationTable = document.getElementById('inverterPanelCompatibiltyTable');
const panelInverterCombinationTableBody = document.getElementById('inverterPanelCompatibiltyTableBody');
const panelInverterCombinationModal = document.getElementById('panelInverterCombinationModal');
const panelInverterCombinationModalInstance = new bootstrap.Modal(panelInverterCombinationModal);
const inverterPanelCombinationForm = document.getElementById('panelInverterCombinationForm');
const panelInverterCombinationModalSubmit = document.getElementById('PanelInverterCombinationModalSubmit')

const makePanelInverterCombinationTable = async () => {
    const tableData = await getTableData(`/getInverterPanelCompatibilityTable`);
    tableData.forEach(row => {
        const rowElement = document.createElement('tr')
        rowElement.setAttribute('data-index', row.id);
        rowElement.innerHTML = `
            <td id="inverterBrandCell">${row.inverterBrandName}</td>
            <td id="panelBrandCell">${row.panelBrandName}(${row.isDCR ? "DCR" : "NDCR"})</td>
            <td id="inverterPanelCombinationBtnCell">
            <button type="button" class="btn btn-danger delete">Delete</button>
            </td>
        `
        panelInverterCombinationTableBody.appendChild(rowElement);
    });
}

makePanelInverterCombinationTable();

panelInverterCombinationModalSubmit.addEventListener('click', async () => {
    const formData = Object.fromEntries(new FormData(inverterPanelCombinationForm));
    if (!('PanelBrandId' in formData) || !('InverterBrandId' in formData) || formData.InverterBrandId == "" || formData.PanelBrandId == "") {
        alert("Please select both inverter and panel brands");
        return;
    }
    return
    // else 
    {
        console.log(formData);
        const inverterBrandId = formData.InverterBrandId;
        const panelBrandId = formData.PanelBrandId;
        const matchingRecordIdsResults = await fetch(`/checkPanelInverterCombinationPresence?InverterBrandId=${inverterBrandId}&panelBrandId=${panelBrandId}`)
        const matchingRecordIds = await matchingRecordIdsResults.json();
        if (matchingRecordIds.length > 0) {
            console.log("Inverter and panel combination already exists");
        } else {
            const requestBody = {
                "inverterBrandId": inverterBrandId,
                "panelBrandId": panelBrandId
            }
            console.log(requestBody);
            const response = await fetch('/addInverterPanelCombination', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            const result = await response.json();
            console.log(result);
            if (result.length == 1) {
                console.log("Inverter and panel combination added successfully");
                resetEstimator();
                makePanelInverterCombinationTable();
            }
            else {
                console.log("Failed to add inverter and panel combination");
            }
        }
    }
    panelInverterCombinationModalInstance.hide();
})

inverterPanelCombinationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    panelInverterCombinationModalSubmit.dispatchEvent(new Event('click'));
})

panelInverterCombinationModal.addEventListener('show.bs.modal', async (event) => {
    await repopulateInverterBrands();
    await repopulatePanelBrands();
})

panelInverterCombinationModal.addEventListener('hide.bs.modal', async (event) => {
    resetPanelInverterCommbinationForm();
})

const repopulatePanelBrands = async () => {
    const panelBrandTableData = await getTableData(`/getPanelBrandsTable`);
    const panelBrandSelect = document.getElementById('PanelBrandName');
    panelBrandSelect.innerHTML = `<option value="" selected disabled> -- Select Panel Brand -- </option>`
    panelBrandTableData.forEach(row => {
        const option = document.createElement('option');
        option.value = row.id;
        option.text = `${row.panelBrand}(${row.isDCR ? "DCR" : "NDCR"})`
        panelBrandSelect.appendChild(option);
    });
}

const repopulateInverterBrands = async () => {
    const invreterBrandTableData = await getTableData(`inverterBrandTable`);
    const inverterBrandSelect = document.getElementById('InverterBrandName');
    inverterBrandSelect.innerHTML = `<option value="" selected disabled> -- Select Inverter Brand -- </option>`
    invreterBrandTableData.forEach(row => {
        const option = document.createElement('option');
        option.value = row.id;
        option.text = row.Inverter_Brand_Name;
        inverterBrandSelect.appendChild(option);
    })
}

panelInverterCombinationTable.addEventListener('click', async (event) => {
    if (event.target && event.target.classList.contains('delete')) {
        const row = event.target.parentNode.parentNode;
        const id = row.getAttribute('data-index');
        row.style.backgroundColor = "gray";
        if (confirm("Are you sure you want to delete this record ?")) {
            const response = await fetch(`/deleteInverterPanelCombination?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                row.remove();
                resetEstimator();
            }
            else {
                // console.log("Failed to delete record");
                row.style.backgroundColor = "white";
            }
        } else {
            row.style.backgroundColor = "white";
        }
    }
})

const resetPanelInverterCommbinationForm = () => {
    document.getElementById('PanelBrandName').value = '';
    document.getElementById('InverterBrandName').value = '';
}