const isDCR = document.getElementById("isDCR");
const panelBrand = document.getElementById("PanelBrand");
const panelCapacity = document.getElementById("PanelCapacity");
const inverterBrand = document.getElementById("InverterBrand");
const totalPlates = document.getElementById("TotalPlates");
const inverterCapacity = document.getElementById("InverterCapacity");
const submitButton = document.getElementById("submitBtn");
const netSolarCapacity = document.getElementById("TotalCapacity");
const netPanelCosting = document.getElementById("NetPanelCosting");
const inverterCosting = document.getElementById("InverterCosting");
const EncCosting = document.getElementById("EncCosting");
const netCosting = document.getElementById("NetCost");
const quotationPrice = document.getElementById("QuotationPrice");
const netQuotedPrice = document.getElementById("NetQuotedPrice");
const profit = document.getElementById("Profit");
const calculateProfitBtn = document.getElementById("ProfitCalculator");

let wholeInfo = {
    "panelPerWattCost": 0,
    "inverterCost": 0,
    "total_capacity": 0,
    "netPanelCost": 0,
    "EncCost": 0,
    "netCost": 0,
    "quotedPricePerWatt": 0,
    "saleprice": 0,
    "profit": 0,
}
const resetEstimator = () => {
    // Clear all input fields
    isDCR.value = "";
    panelBrand.value = "";
    panelCapacity.value = "";
    inverterBrand.value = "";
    totalPlates.value = "";
    inverterCapacity.value = "";
    netSolarCapacity.innerText = "";
    netPanelCosting.innerText = "";
    inverterCosting.innerText = "";
    EncCosting.innerText = "";
    netCosting.innerText = "";
    quotationPrice.value = "";
    netQuotedPrice.innerText = "";
    profit.innerText = "";
    // calculateProfitBtn.value = "";
    // Reset the form to its initial state
    // document.getElementById("panelForm").reset();
    // Reset the wholeInfo object
    wholeInfo = {
        "panelPerWattCost": 0,
        "inverterCost": 0,
        "total_capacity": 0,
        "netPanelCost": 0,
        "EncCost": 0,
        "netCost": 0,
        "quotedPricePerWatt": 0,
        "saleprice": 0,
        "profit": 0,
    }
}

document.documentElement.scrollTop = 0;
isDCR.value = "";

async function completeSheet(EncDetails) {
    // console.log("collecting data and completing sheet")
    wholeInfo.panelPerWattCost = await getPanelCost();
    wholeInfo.inverterCost = await getInverterCost();
    wholeInfo.total_capacity = panelCapacity.value * totalPlates.value;
    wholeInfo.netPanelCost = wholeInfo.panelPerWattCost * wholeInfo.total_capacity;
    wholeInfo.EncCost = getEncCost(EncDetails);
    wholeInfo.netCost = wholeInfo.inverterCost + wholeInfo.netPanelCost + wholeInfo.EncCost;
    netSolarCapacity.innerText = wholeInfo.total_capacity;
    netPanelCosting.innerText = ((wholeInfo.netPanelCost) / wholeInfo.total_capacity).toFixed(2);
    inverterCosting.innerText = ((wholeInfo.inverterCost) / wholeInfo.total_capacity).toFixed(2);
    EncCosting.innerText = ((wholeInfo.EncCost) / wholeInfo.total_capacity).toFixed(2);
    netCosting.innerText = ((wholeInfo.netCost) / wholeInfo.total_capacity).toFixed(2);
}
async function getInverterCost() {
    const response = await fetch(`/inverterCostBasedOnInverterBrandAndCapacity?inverterBrand=${inverterBrand.value}&inverterCapacity=${inverterCapacity.value}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let fetchedDetails = await response.json();
    return fetchedDetails;
}
async function getPanelCost() {
    const response = await fetch(`/panel_cost?isDCR=${isDCR.value}&panelBrand=${panelBrand.value}&capacity_variant=${panelCapacity.value}`, {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let fetchedDetails = await response.json();
    return fetchedDetails;
}
function getEncCost(EncDetails,) {
    let price = 0;

    price += wholeInfo.total_capacity * parseFloat(EncDetails.structure_per_watt || 0);
    price += wholeInfo.total_capacity * parseFloat(EncDetails.labour_per_watt || 0);

    price += parseFloat(EncDetails.earth_wire || 0);
    price += parseFloat(EncDetails.main_wire || 0);
    price += parseFloat(EncDetails.connection_wire || 0);
    price += parseFloat(EncDetails.three_earthing_rod || 0);
    price += parseFloat(EncDetails.lightning_arrester || 0);
    price += parseFloat(EncDetails.insulator || 0);
    price += parseFloat(EncDetails.acdb || 0);
    price += parseFloat(EncDetails.dcdb || 0);
    price += parseFloat(EncDetails.piping_and_accessories || 0);

    return price;
}

// Function to reset and disable fields
function resetAndDisableFields(fields) {
    fields.forEach(field => {
        field.innerHTML = `<option value="" selected disabled >-- Select --</option>`; // Reset options
        field.value = ""; // Clear selection
        field.classList.add("disabled"); // Disable field
    });
}

function enableField(field) {
    field.classList.remove("disabled");
}

// Function to fetch and populate dropdowns
async function fetchOptions(url, params, field) {
    try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${url}?${queryString}`);
        const data = await response.json();
        field.innerHTML = `<option value="" selected disabled>-- Select --</option>`;
        data.forEach(item => {
            field.innerHTML += `<option value="${item}">${item}</option>`;
        });
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
    }
}

// Initially disable all fields except isDCR
resetAndDisableFields([panelBrand, panelCapacity, inverterBrand, totalPlates, inverterCapacity]);

// Handle DCR selection change
isDCR.addEventListener("change", async function () {
    console.log("DCR changed");
    resetAndDisableFields([panelBrand, panelCapacity, inverterBrand, totalPlates, inverterCapacity]);

    if (isDCR.value) {
        enableField(panelBrand);
        await fetchOptions("/panelBrands", { isDCR: isDCR.value }, panelBrand);
    }
});

panelBrand.addEventListener("change", async function () {
    resetAndDisableFields([panelCapacity, inverterBrand, totalPlates, inverterCapacity]);

    if (panelBrand.value) {
        enableField(panelCapacity);
        console.log(`Fetching panel capacities for: isDCR=${isDCR.value}, panelBrand=${panelBrand.value}`);
        await fetchOptions("/panelCapacityVariants", { isDCR: isDCR.value, panelBrand: panelBrand.value }, panelCapacity);
    }
});

// Handle PanelCapacity selection change
panelCapacity.addEventListener("change", async function () {
    resetAndDisableFields([totalPlates, inverterCapacity]);

    if (panelCapacity.value) {
        enableField(inverterBrand);
        await fetchOptions("/allInverterBrands", {}, inverterBrand);
    }
});

// Handle InverterBrand selection change
inverterBrand.addEventListener("change", function () {
    if (inverterBrand.value) {
        enableField(totalPlates);
        enableField(inverterCapacity);
    }
});

submitButton.addEventListener("click", async function (event) {
    // console.log("calculate button clicked")
    event.preventDefault();
    let fail = false;
    if (totalPlates.value === "") {
        alert("Please enter the total number of plates");
        fail = true;
    }
    if (panelCapacity.value === "") {
        alert("Please enter the capacity of plates");
        fail = true;
    }
    if (inverterCapacity.value === "") {
        alert("Please enter the inverter capacity");
        fail = true;
    }
    if (fail) return;
    // console.log("let's calculate price");
    let totalCapacity = totalPlates.value * panelCapacity.value;
    const id = totalCapacity > 5000 ? 2 : 1;

    try {
        let response = await fetch(`/erection_and_commissioning_cost?id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let fetchedDetails = await response.json();
        let details = fetchedDetails[0];
        // console.log("Fetched Details:", details);

        await completeSheet(details);
        // console.log("completed sheet");
        quotationPrice.focus();

    } catch (error) {
        console.error("Error fetching data:", error);
    }
});
calculateProfitBtn.addEventListener("click", (event) => {
    event.preventDefault();
    if (quotationPrice.value == "") {
        alert("Please enter the quotation price");
        return;
    }
    wholeInfo.quotedPricePerWatt = parseFloat(quotationPrice.value)
    wholeInfo.saleprice = wholeInfo.total_capacity * wholeInfo.quotedPricePerWatt;
    netQuotedPrice.innerHTML = wholeInfo.saleprice;
    wholeInfo.profit = wholeInfo.saleprice - wholeInfo.netCost;
    if (wholeInfo.profit <= 0) {
        profit.style.color = 'red';
    } else {
        profit.style.color = 'green';
    }

    profit.innerText = wholeInfo.profit;
})