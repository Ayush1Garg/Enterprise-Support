const invertersTable = document.getElementById('inverterPriceTable');
const inverterTableBody = document.getElementById('inverterPriceTableBody');
const addInverterItemBtn = document.getElementById('addInverterItemBtn')
const addInverterVariantBtn = document.getElementById('addInverterVariantBtn');
const inverterBrandSelect = document.getElementById('oldInverterBrandName');
const inverterModalSubmit = document.getElementById('inverterModalSubmit');
const inverterBrandForm = document.getElementById('inverterBrandForm');
const inverterCapacityForm = document.getElementById('inverterCapacityForm');
const inverterModal = document.getElementById('inverterModal');
const inverterModalInstance = new bootstrap.Modal(inverterModal);
const invertersCapacityRowsContainer = document.getElementById('invertersCapacityRowsContainer');
let selectedInverterForm;

const makeInverterTable = async () => {
    const tableData = await getTableData(`/allInverters`);
    inverterTableBody.innerHTML = "";

    tableData.forEach(row => {
        const rowElement = document.createElement('tr');
        rowElement.setAttribute('data-index', row.id);
        let rowHTML = `
            <td id="inverterBrandNameCell">${row.Inverter_Brand}</td>
            <td id="inverterCapacityCell">${row.capacity}</td>
            <td id="inverterPriceCell">${row.price == 0 ? '' : row.price}</td>
            <td class="inverterBtnCell">
            <button class="btn btn-warning edit">Edit</button>
            <button class="btn btn-danger delete">Delete</button>
            </td>`
        rowElement.innerHTML = rowHTML;
        inverterTableBody.appendChild(rowElement);
    });
}
makeInverterTable();

inverterTableBody.addEventListener('click', async (event) => {
    if (event.target && event.target.classList.contains('edit')) {
        const row = event.target.parentNode.parentNode;
        const inverterPriceCell = row.children[2];
        const inverterBtnCell = row.children[3];
        inverterPriceCell.setAttribute('contenteditable', true);
        inverterPriceCell.setAttribute('data-original', inverterPriceCell.innerText);
        inverterPriceCell.classList.add('editing');
        inverterPriceCell.focus();
        inverterBtnCell.innerHTML = `
        <button class="btn btn-success save">Save</button>
        <button class="btn btn-secondary cancel">Cancel</button>
        `;
    }
    else if (event.target && event.target.classList.contains('delete')) {
        const row = event.target.parentNode.parentNode;
        const id = row.getAttribute('data-index');
        row.style.backgroundColor = "gray";
        if (confirm("Are you sure you want to delete this record ?")) {
            const response = await fetch(`/deleteInverterCapacityVariant?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (response.ok) {
                row.remove();
                // resetEstimator();
            }
            else {
                alert("Failed to delete record");
                row.style.backgroundColor = "white";
            }
        } else {
            row.style.backgroundColor = "white";
        }
    } else if (event.target && event.target.classList.contains('save')) {
        const row = event.target.parentNode.parentNode;
        const id = row.getAttribute('data-index');
        const inverterPriceCell = row.children[2];
        const inverterBtnCell = row.children[3];
        if (!(inverterPriceCell.innerText == inverterPriceCell.getAttribute('data-original'))) {
            const cellText = inverterPriceCell.innerText;
            const numbers = cellText.trim().match(/\d+(\.\d+)?/);
            if (!numbers) {
                alert("Invalid price format");
                return;
            }
            const response = await fetch(`/updatePriceOfExistingInverter?id=${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ price: numbers[0] })
            });
            if (response.ok) {
                // console.log('price updated successfully');
                resetEstimator();
            } else {
                alert('Failed to update price');
            }
        }
        inverterPriceCell.setAttribute('contenteditable', false);
        inverterPriceCell.classList.remove('editing');
        inverterBtnCell.innerHTML = `
        <button class="btn btn-warning edit">Edit</button>
        <button class="btn btn-danger delete">Delete</button>
        `;
    } else if (event.target && event.target.classList.contains('cancel')) {
        const row = event.target.parentNode.parentNode;
        const inverterPriceCell = row.children[2];
        const inverterBtnCell = row.children[3];
        inverterPriceCell.innerHTML = inverterPriceCell.getAttribute('data-original');
        inverterPriceCell.setAttribute('contenteditable', false);
        inverterPriceCell.classList.remove('editing');
        inverterBtnCell.innerHTML = `
        <button class="btn btn-warning edit">Edit</button>
        <button class="btn btn-danger delete">Delete</button>
        `;
    }
})

// Get all radio buttons
const invertersModalRadioButtons = document.querySelectorAll('input[name="AddInverter"]');
invertersModalRadioButtons.forEach(radio => {
    radio.addEventListener('change', async function () {
        inverterBrandForm.classList.add("removed");
        inverterCapacityForm.classList.add("removed");
        if (document.getElementById('newInverterBrand').checked) {
            inverterBrandForm.classList.remove("removed");
            selectedInverterForm = inverterBrandForm;
            resetInverterCapacityForm();
        } else if (document.getElementById('newInverterCapacity').checked) {
            inverterCapacityForm.classList.remove("removed");
            resetInverterBrandForm();
            selectedInverterForm = inverterCapacityForm;
            populateInverterBrands()
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const selectedRadio = document.querySelector('input[name="AddInverter"]:checked');
    if (selectedRadio) {
        selectedRadio.dispatchEvent(new Event('change'));
    }
});

addInverterVariantBtn.addEventListener('click', () => {
    // console.log(inverterBrandSelect.value);
    const disableStatus = (inverterBrandSelect.value === "") ? 'disabled' : '';
    const rowContainer = document.getElementById('invertersCapacityRowsContainer');
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

inverterBrandSelect.addEventListener('change', () => {
    if (inverterBrandSelect.value == "") {
        return;
    }
    invertersCapacityRowsContainer.innerHTML = `
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

inverterBrandForm.addEventListener('submit', (e) => {
    // e.preventDefault();
    inverterModalSubmit.dispatchEvent(new Event('click'));
})

inverterCapacityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    inverterModalSubmit.dispatchEvent(new Event('click'));
})

inverterModalSubmit.addEventListener('click', async () => {
    console.log("Form Submt attempted");
    if (selectedInverterForm == inverterBrandForm) {
        const brandName = Object.fromEntries(new FormData(inverterBrandForm)).newInverterBrandName;
        const inverterBrandListResult = await fetch(`/allInverterBrands`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const inverterBrandList = await inverterBrandListResult.json();
        // console.log(inverterBrandList);
        const newInverterBrandList = inverterBrandList.map(brand => brand.toLowerCase());
        if (!newInverterBrandList.includes(brandName.toLowerCase())) {
            const response = await fetch(`addInverterBrands`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: brandName })
            })
            if (response.ok) {
                // console.log("Brand Successfully Added")
                resetEstimator();
            } else {
                alert('Error adding inverter brand');
            }
            // console.log("Add brand", brandName)
        } else {
            // console.log("Brand Already Exists")
        }
        resetInverterBrandForm();
        inverterModalInstance.hide();
    } else if (selectedInverterForm == inverterCapacityForm) {
        const inverterCapacityFormData = new FormData(inverterCapacityForm);
        const requestBody = {
            "name": inverterCapacityFormData.get("oldInverterBrandName"),
            "capacity": inverterCapacityFormData.getAll("capacity[]"),
            "price": inverterCapacityFormData.getAll("price[]")
        };
        // console.log(requestBody);
        // console.log('Posting Data')
        const response = await fetch('/addCapacityVariantToExistingInverterBrand', {
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
        makeInverterTable();
        resetInverterCapacityForm();
        inverterModalInstance.hide();
    } else {
        inverterModalInstance.hide();
    }
});

inverterModal.addEventListener('hide.bs.modal', function () {
    // console.log("Closing Inverter Modal");
    resetInverterCapacityForm();
    resetInverterBrandForm();
});

async function populateInverterBrands() {
    const inverterBrandListResult = await fetch(`/allInverterBrands`);
    const inverterBrandList = await inverterBrandListResult.json();
    inverterBrandSelect.innerHTML = `<option value="" selected disabled> Select Inverter Brand </option>`;
    inverterBrandList.forEach(brandName => {
        const option = document.createElement('option');
        option.value = brandName;
        option.text = brandName;
        inverterBrandSelect.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', async function () {
    await populateInverterBrands();
    invertersCapacityRowsContainer.addEventListener('click', async function (e) {
        if (e.target && e.target.classList.contains('form-control')) {
            const inputRow = e.target.parentElement.parentElement;
            // console.log(inputRow);
            const capacityInput = inputRow.querySelector('#capacity');
            const priceInput = inputRow.querySelector('#price');
            if (!capacityInput.hasEventListener) {
                capacityInput.addEventListener('change', async () => {
                    // console.log('Capacity Change Attempted');
                    const capacity = capacityInput.value;
                    const availableCapacitiesResult = await fetch(`/getAllCapacitesAsPerInverterBrand?name=${inverterBrandSelect.value}`);
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

const resetInverterCapacityForm = () => {
    inverterCapacityForm.reset();
    invertersCapacityRowsContainer.innerHTML = `
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

const resetInverterBrandForm = () => {
    inverterBrandForm.reset();
    inverterBrandSelect.value = "";
}