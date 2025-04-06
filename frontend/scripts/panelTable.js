const panelsTable = document.getElementById('panelPriceTable');
const panelTableBody = document.getElementById('panelPriceTableBody');
const addPanelItemBtn = document.getElementById('addPanelItemBtn')
const addPanelVariantBtn = document.getElementById('addPanelVariantBtn');
const panelBrandSelect = document.getElementById('oldPanelBrandId');
const panelModalSubmit = document.getElementById('panelModalSubmit');
const panelBrandForm = document.getElementById('panelBrandForm');
const panelCapacityForm = document.getElementById('panelCapacityForm');
const panelModal = document.getElementById('panelModal');
const panelModalInstance = new bootstrap.Modal(panelModal);
const panelsCapacityRowsContainer = document.getElementById('panelsCapacityRowsContainer');
const panelsModalRadioButtons = document.querySelectorAll('input[name="AddPanel"]');
let selectedPanelForm;

const makePanelTable = async () => {
    const tableData = await getTableData(`/getPanelPriceTable`);
    panelTableBody.innerHTML = "";

    tableData.forEach(row => {
        const rowElement = document.createElement('tr');
        rowElement.setAttribute('data-index', row.id);
        let rowHTML = `
            <td id="panelBrandNameCell">${row.panelBrand} (${row.isDCR ? 'DCR' : 'NDCR'})</td>
            <td id="panelCapacityCell">${row.panelCapacity}</td>
            <td id="panelPriceCell">${row.pricePerWatt == 0 ? '' : row.pricePerWatt}</td>
            <td class="panelBtnCell">
            <button class="btn btn-warning edit">Edit</button>
            <button class="btn btn-danger delete">Delete</button>
            </td>`
        rowElement.innerHTML = rowHTML;
        panelTableBody.appendChild(rowElement);
    });
}
makePanelTable();

panelTableBody.addEventListener('click', async (event) => {
    if (event.target && event.target.classList.contains('edit')) {
        const row = event.target.parentNode.parentNode;
        const panelPriceCell = row.children[2];
        const panelBtnCell = row.children[3];
        panelPriceCell.setAttribute('contenteditable', true);
        panelPriceCell.setAttribute('data-original', panelPriceCell.innerText);
        panelPriceCell.classList.add('editing');
        panelPriceCell.focus();
        panelBtnCell.innerHTML = `
        <button class="btn btn-success save">Save</button>
        <button class="btn btn-secondary cancel">Cancel</button>
        `;
    }
    else if (event.target && event.target.classList.contains('delete')) {
        const row = event.target.parentNode.parentNode;
        const id = row.getAttribute('data-index');
        row.style.backgroundColor = "gray";
        if (confirm("Are you sure you want to delete this record ?")) {
            const response = await fetch(`${CONFIG.BACKEND_URL}/deletePanelCapacityVariant?id=${id}`, {
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
    } else if (event.target && event.target.classList.contains('save')) {
        const row = event.target.parentNode.parentNode;
        const id = row.getAttribute('data-index');
        const panelPriceCell = row.children[2];
        const panelBtnCell = row.children[3];
        if (!(panelPriceCell.innerText == panelPriceCell.getAttribute('data-original'))) {
            const cellText = panelPriceCell.innerText;
            const numbers = cellText.trim().match(/\d+(\.\d+)?/);
            if (!numbers) {
                alert("Invalid price format");
                return;
            }
            const response = await fetch(`${CONFIG.BACKEND_URL}/updatePriceOfExistingPanelCapacityVariant?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "price": panelPriceCell.innerText })
            });
            if (response.ok) {
                // console.log('price updated successfully');
                resetEstimator();
            } else {
                alert('Failed to update price');
            }
        }
        panelPriceCell.setAttribute('contenteditable', false);
        panelPriceCell.classList.remove('editing');
        panelBtnCell.innerHTML = `
        <button class="btn btn-warning edit">Edit</button>
        <button class="btn btn-danger delete">Delete</button>
        `;
    } else if (event.target && event.target.classList.contains('cancel')) {
        const row = event.target.parentNode.parentNode;
        const panelPriceCell = row.children[2];
        const panelBtnCell = row.children[3];
        panelPriceCell.innerHTML = panelPriceCell.getAttribute('data-original');
        panelPriceCell.setAttribute('contenteditable', false);
        panelPriceCell.classList.remove('editing');
        panelBtnCell.innerHTML = `
        <button class="btn btn-warning edit">Edit</button>
        <button class="btn btn-danger delete">Delete</button>
        `;
    }
})

panelsModalRadioButtons.forEach(radio => {
    radio.addEventListener('change', async function () {
        panelBrandForm.classList.add("removed");
        panelCapacityForm.classList.add("removed");
        if (document.getElementById('newPanelBrand').checked) {
            panelBrandForm.classList.remove("removed");
            selectedPanelForm = panelBrandForm;
            resetPanelCapacityForm();
        } else if (document.getElementById('newPanelCapacity').checked) {
            panelCapacityForm.classList.remove("removed");
            resetPanelBrandForm();
            selectedPanelForm = panelCapacityForm;
            populatePanelBrands()
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const selectedRadio = document.querySelector('input[name="AddPanel"]:checked');
    if (selectedRadio) {
        selectedRadio.dispatchEvent(new Event('change'));
    }
});

addPanelVariantBtn.addEventListener('click', () => {
    // console.log(panelBrandSelect.value);
    const disableStatus = (panelBrandSelect.value === "") ? 'disabled' : '';
    const rowContainer = document.getElementById('panelsCapacityRowsContainer');
    const newRow = document.createElement('div');
    newRow.classList.add('input-row');
    newRow.setAttribute("style", "display: flex; gap: 10px; align-items: center;")
    newRow.innerHTML = `
    <div style="display: flex; align-items: center;">
        <label>Capacity:</label>
        <input type="number" name="capacity[]" class="form-control ${disableStatus}" placeholder="Enter capacity" id="capacity" required>
    </div>
    <div style="display: flex; align-items: center;">
        <label>Price:</label>
        <input type="number" name="price[]"class="form-control disabled" placeholder="Enter price" id="price">
    </div>
    <div style="display: flex; align-items: center;">
        <button type="button" class="delete-input-row btn btn-danger"> Cancel </button>
    </div>`;
    rowContainer.appendChild(newRow);
    const deleteButton = newRow.querySelector('.delete-input-row');
    deleteButton.addEventListener('click', (event) => {
        event.preventDefault();
        newRow.remove();
    });
});

panelBrandSelect.addEventListener('change', () => {
    if (panelBrandSelect.value == "") {
        return;
    }
    panelsCapacityRowsContainer.innerHTML = `
        <div class="input-row original" style="display: flex; gap: 10px; align-items: center;">
        <div style="display: flex; align-items: center;">
            <label>Capacity:</label>
            <input type="number" name="capacity[]" id="capacity" class="form-control disabled" placeholder="Enter capacity" required>
        </div>
        <div style="display: flex; align-items: center;">
            <label>Price:</label>
            <input type="number" name="price[]" id="price" class="form-control disabled" placeholder="Enter price">
        </div>
    </div>
    `;
    document.querySelectorAll('#capacity').forEach((capacityInput) => {
        capacityInput.classList.remove('disabled');
    });
})

panelBrandForm.addEventListener('submit', (e) => {
    e.preventDefault();
    panelModalSubmit.dispatchEvent(new Event('click'));
})

panelCapacityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    panelModalSubmit.dispatchEvent(new Event('click'));
})

panelModalSubmit.addEventListener('click', async () => {
    if (selectedPanelForm == panelBrandForm) {
        const panelBrandFormData = Object.fromEntries(new FormData(panelBrandForm));
        // console.log(panelBrandFormData);
        const brandName = panelBrandFormData.newPanelBrand;
        if (panelBrandFormData.dcrStatus == "" || brandName == "") {
            alert("Please select all feilds");
            return;
        }
        const isDCR = panelBrandFormData.dcrStatus == "true";
        const panelBrandListResult = await fetch(`${CONFIG.BACKEND_URL}/getPanelBrandsTable`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const panelBrandList = await panelBrandListResult.json();
        // console.log(panelBrandList);
        // console.log(brandName)
        // const newPanelBrandList = panelBrandList.map(brand => brand.toLowerCase());
        const matchingPanelList = panelBrandList.filter(panel => panel.panelBrand.toLowerCase() == brandName.toLowerCase() && panel.isDCR == isDCR)
        if (matchingPanelList.length == 0) {
            const response = await fetch(`${CONFIG.BACKEND_URL}/addPanelBrand`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "name": brandName, "isDCR": isDCR })
            })
            if (response.ok) {
                // console.log("Brand Successfully Added")
                resetEstimator();
            } else {
                // alert('Error adding panel brand');
            }
            // console.log("Add brand", brandName, isDCR)
        } else {
            // console.log("Brand Already Exists")
        }
        resetPanelBrandForm();
        panelModalInstance.hide();
    } else if (selectedPanelForm == panelCapacityForm) {
        const panelCapacityFormData = new FormData(panelCapacityForm);
        const requestBody = {
            "panel_brand_id": panelCapacityFormData.get("oldPanelBrandId"),
            "capacity": panelCapacityFormData.getAll("capacity[]"),
            "price": panelCapacityFormData.getAll("price[]")
        };
        // console.log(requestBody);
        // console.log('Posting Data')
        const response = await fetch(`${CONFIG.BACKEND_URL}/addCapacityVariantToExistingPanelBrand`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })
        // console.log('post attempted');
        if (response.ok) {
            // console.log("Capacities Successfully Added")
            resetEstimator();
        } else {
            // console.log("Can't add Capacities")
        }
        makePanelTable();
        resetPanelCapacityForm();
        panelModalInstance.hide();
    } else {
        panelModalInstance.hide();
    }
});

panelModal.addEventListener('hide.bs.modal', function () {
    // console.log("Closing Panel Modal");
    resetPanelCapacityForm();
    resetPanelBrandForm();
});

async function populatePanelBrands() {
    const panelBrandListResult = await fetch(`${CONFIG.BACKEND_URL}/getPanelBrandsTable`);
    const panelBrandList = await panelBrandListResult.json();
    panelBrandSelect.innerHTML = `<option value="" selected disabled> Select Panel Brand </option>`;
    panelBrandList.forEach(brand => {
        const option = document.createElement('option');
        option.value = `${brand.id}`;
        option.text = `${brand.panelBrand} (${brand.isDCR ? 'DCR' : 'NDCR'})`;
        panelBrandSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    await populatePanelBrands();
    panelsCapacityRowsContainer.addEventListener('click', async function (e) {
        if (e.target && e.target.classList.contains('form-control')) {
            const inputRow = e.target.parentElement.parentElement;
            // console.log(inputRow);
            const capacityInput = inputRow.querySelector('#capacity');
            const priceInput = inputRow.querySelector('#price');
            if (!capacityInput.hasEventListener) {
                capacityInput.addEventListener('change', async () => {
                    // console.log('Capacity Changed');
                    const capacity = capacityInput.value;
                    const availableCapacitiesResult = await fetch(`${CONFIG.BACKEND_URL}/getAllCapacitesAsPerPanelBrandId?id=${panelBrandSelect.value}`);
                    const availableCapacities = await availableCapacitiesResult.json();

                    if (availableCapacities.includes(capacity)) {
                        capacityInput.focus();
                        priceInput.value = "";
                        priceInput.classList.add('disabled');
                        alert('Capacity already exists');
                        return;
                    }
                    priceInput.classList.remove('disabled');
                });
                capacityInput.hasEventListener = true;
            }
        }
    });
});

const resetPanelCapacityForm = () => {
    panelCapacityForm.reset();
    panelsCapacityRowsContainer.innerHTML = `
        <div class="input-row original" style="display: flex; gap: 10px; align-items: center;">
        <div style="display: flex; align-items: center;">
            <label>Capacity:</label>
            <input type="number" name="capacity[]" id="capacity" class="form-control disabled" placeholder="Enter capacity" required>
        </div>
        <div style="display: flex; align-items: center;">
            <label>Price:</label>
            <input type="number" name="price[]" id="price" class="form-control disabled" placeholder="Enter price">
        </div>
    </div>
    `;
}

const resetPanelBrandForm = () => {
    panelBrandForm.reset();
    panelBrandSelect.value = "";
}