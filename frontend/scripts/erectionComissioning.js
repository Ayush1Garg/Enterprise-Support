const ErectionCommissioningCostTable = document.getElementById('encCostTable');
const ErectionCommissioningCostTableBody = document.getElementById('encCostTableBody');

const makeEncCostTable = async () => {
    const tableData = await getTableData('/erectionCommissioningCostTable');
    tableData.forEach(row => {
        const rowElement = document.createElement('tr');
        rowElement.setAttribute('data-index', row.id);
        const range = row.id == 1 ? "0-5000" : "5000+"
        rowElement.innerHTML = `
        <td>${range}</td>
        <td class="encPriceCell" data-col="structure_per_watt">${row.structure_per_watt}</td>
        <td class="encPriceCell" data-col="earth_wire">${row.earth_wire}</td>
        <td class="encPriceCell" data-col="main_wire">${row.main_wire}</td>
        <td class="encPriceCell" data-col="connection_wire">${row.connection_wire}</td>
        <td class="encPriceCell" data-col="three_earthing_rod">${row.three_earthing_rod}</td>
        <td class="encPriceCell" data-col="lightning_arrester">${row.lightning_arrester}</td>
        <td class="encPriceCell" data-col="insulator">${row.insulator}</td>
        <td class="encPriceCell" data-col="acdb">${row.acdb}</td>
        <td class="encPriceCell" data-col="dcdb">${row.dcdb}</td>
        <td class="encPriceCell" data-col="piping_and_accessories">${row.piping_and_accessories}</td>
        <td class="encPriceCell" data-col="labour_per_watt">${row.labour_per_watt}</td>
        <td id="encBtnCell">
        <button type="button" class="btn btn-warning edit">Edit</button>
        <button type="button" class="btn btn-danger delete">Delete</button>
        </td>
        `
        ErectionCommissioningCostTableBody.appendChild(rowElement);
    });
}

makeEncCostTable();

ErectionCommissioningCostTable.addEventListener('click', async (event) => {
    if (event.target && event.target.classList.contains('edit')) {
        const row = event.target.parentNode.parentNode;
        // const id = row.getAttribute('data-index');
        for (let i = 1; i < 12; i++) {
            const cell = row.children[i];
            cell.setAttribute('data-original', cell.innerText);
            cell.contentEditable = true;
            cell.classList.add("editing");
        }
        const encBtnCell = row.querySelector('#encBtnCell');
        encBtnCell.innerHTML = `
        <button type="button" class="btn btn-success save">Save</button>
        <button type="button" class="btn btn-secondary cancel">Cancel</button>
        `
        // row.style.backgroundColor = "gray";
    } else if (event.target && event.target.classList.contains('cancel')) {
        const row = event.target.parentNode.parentNode;
        for (let i = 1; i < 12; i++) {
            const cell = row.children[i];
            cell.innerHTML = cell.getAttribute('data-original');
            cell.contentEditable = false;
            cell.classList.remove("editing");
        }
        const encBtnCell = row.querySelector('#encBtnCell')
        encBtnCell.innerHTML = `
        <button type="button" class="btn btn-warning edit">Edit</button>
        <button type="button" class="btn btn-danger delete">Delete</button>`
    } else if (event.target && event.target.classList.contains('save')) {
        const row = event.target.parentNode.parentNode;
        const id = row.getAttribute('data-index');
        let requestBody = {};
        let issues = 0;
        let putRequired = false;
        for (let i = 1; i < 12; i++) {
            const cell = row.children[i];
            const key = cell.getAttribute('data-col');
            const cellText = cell.innerText
            const numbers = cellText.trim().match(/\d+(\.\d+)?/);
            if (!numbers) {
                issues++;
            } else {
                if (Number(cell.getAttribute('data-original')) != numbers[0]) putRequired = true;
                requestBody[key] = numbers[0];
            }
        }
        if (!putRequired) {
            // Do nothing
            return;
        }
        if (issues != 0) {
            alert("Please enter the correct price in the highlighted fields.");
            return;
        }
        // console.log(requestBody);
        const response = await fetch(`/updateEncCost?id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        })
        if (response.ok) {
            // console.log("EnC cost updated successfully");
            resetEstimator();
            for (let i = 1; i < 12; i++) {
                const cell = row.children[i];
                const key = cell.getAttribute('data-col')
                cell.innerHTML = `${requestBody[key]}`
                cell.contentEditable = false;
                cell.classList.remove("editing");
            }
            const encBtnCell = row.querySelector('#encBtnCell')
            encBtnCell.innerHTML = `
            <button type="button" class="btn btn-warning edit">Edit</button>
            <button type="button" class="btn btn-danger delete">Delete</button>`
        } else {
            alert("Failed to update EnC cost");
        }
    } else if (event.target && event.target.classList.contains('delete')) {
        const row = event.target.parentNode.parentNode;
        const id = row.getAttribute('data-index');
        if (confirm("Are you sure you want to  delete this record")) {
            // const response = await fetch(`/deleteEncCost?id=${id}`, {
            //     method: 'DELETE',
            // })
            // if (response.ok) {
            //     row.remove();
            //     resetEstimator();
            // }
        }
    }
})