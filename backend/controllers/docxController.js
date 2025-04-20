const fs = require('fs');
const path = require('path');
const docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');


const outputDir = path.join(__dirname, '../output');
if (!fs.existsSync(outputDir)) {
    try {
        fs.mkdirSync(outputDir);
    } catch (err) {
        return res.status(500).send("Error creating output directory.");
    }
}

const generateFile = async (req, res) => {
    const {
        vendorName, inverter_capacity, inverter_brand, panel_capacity, panel_brand,
        invoice_date, invoice_number, consumer_name, consumer_address,
        net_solar_capacity, no_of_panels, serial_numbers
    } = req.body;
    const template = vendorName == "Mamta Enterprises" ? "MamtaEnterprises_Docs" : "NDTechnoSolutions_Docs";
    const wordTemplate = template + ".docx";

    const templatesDir = path.join(__dirname, '../templates');
    const templatePath = path.join(templatesDir, wordTemplate);
    if (!fs.existsSync(templatePath)) {
        return res.status(404).send("Template not found.");
    }
    fs.readFile(templatePath, 'binary', (err, data) => {
        if (err) return res.status(500).send("Error reading template file.");

        const zip = new PizZip(data);
        const doc = new docxtemplater(zip);

        let serialData = {};
        for (let i = 0; i < 24; i++) {
            serialData[`serial_number_${i + 1}`] = serial_numbers[i] || "";
        }

        doc.render({
            ...serialData,
            inverter_capacity: inverter_capacity,
            inverter_brand: inverter_brand,
            panel_capacity: panel_capacity,
            panel_brand: panel_brand,
            invoice_date: invoice_date,
            invoice_number: "ME/2025-26/" + String(invoice_number),
            consumer_name: consumer_name,
            consumer_address: consumer_address,
            net_solar_capacity: net_solar_capacity,
            no_of_panels: no_of_panels
        });

        const docxPath = path.join(outputDir, wordTemplate);
        fs.writeFileSync(docxPath, doc.getZip().generate({ type: 'nodebuffer' }));
        res.setHeader("Content-Type", "application/json");
        res.json({ previewLink: `/preview?file=${encodeURIComponent(wordTemplate)}&type=docx` });
    });
}

const previewFile = async (req, res) => {
    const filename = req.query.file;
    const fileType = req.query.type;
    const filePath = path.join(outputDir, decodeURIComponent(filename));

    if (!fs.existsSync(filePath)) {
        return res.status(404).send("File not found.");
    }

    if (fileType == "pdf") {
        res.setHeader("Content-Type", "application/pdf");
    } else if (fileType == "docx") {
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    } else {
        return res.status(400).send("Invalid file type.");
    }
    res.setHeader("Content-Disposition", "inline");
    fs.createReadStream(filePath).pipe(res);
}

const generateQuotation = async (req, res) => {
    const vendorName = req.body.vendorSelect;
    if(vendorName == "Mamta Enterprises"){
        return await makeMamtaQuotation(req,res);
    }else if(vendorName == "ND Techno Solutions"){
        return await makeNDTechnoQuotation(req,res);
    }else{
        return res.status(400).send("Invalid vendorName.");
    }
}

const makeMamtaQuotation = async (req,res) => {
    const {inverterCapacity, inverterBrandName, panelCapacity, panelBrandName, panelType,
        noOfPanels, netCapacity, contactPerson, customerAddress,
        netCost, contactEmail, contactNo, customerName, } = req.body;
    const units = netCapacity*1350, baseCost = Math.floor(netCost/1.12), tax = netCost - baseCost;
    const templatesDir = path.join(__dirname, '../templates');
    const wordTemplate = "Mamta Enterprises Quotation.docx"
    const templatePath = path.join(templatesDir, wordTemplate);
    if (!fs.existsSync(templatePath)) {
        return res.status(404).send("Template not found.");
    }
    fs.readFile(templatePath, 'binary', (err, data) => {
        if (err) return res.status(500).send("Error reading template file.");
        const zip = new PizZip(data);
        const doc = new docxtemplater(zip);
        doc.render({
            inverterCapacity: inverterCapacity, //
            inverterBrand: inverterBrandName, //
            panelCapacity: panelCapacity, //
            panelBrand: panelBrandName, //
            panelType: panelType, //
            NoOfPanels: noOfPanels, //
            netCapacity: netCapacity, //
            contactEmail: contactEmail, //
            contactNo: contactNo, //
            customerName: customerName, //
            netCost: netCost,
            units: units, //
            baseCost: baseCost, //
            tax: tax,
            customerAddress : customerAddress,
            contactPerson : contactPerson == "" ? customerName : contactPerson
        });
        const docxPath = path.join(outputDir, wordTemplate);
        fs.writeFileSync(docxPath, doc.getZip().generate({ type: 'nodebuffer' }));
        res.setHeader("Content-Type", "application/json");
        res.json({ previewLink: `/preview?file=${encodeURIComponent(wordTemplate)}&type=docx` });
    });
}

const makeNDTechnoQuotation = async (req,res) => {
    const {inverterCapacity, inverterBrandName, panelCapacity, panelBrandName, panelType,
        noOfPanels, connectionType, roofType, connectedLoad, netCapacity, phase,
        netCost, contactEmail, contactNo, customerName, } = req.body;
    const units = netCapacity*1350, baseCost = Math.floor(netCost/1.12), tax = netCost - baseCost;
    const templatesDir = path.join(__dirname, '../templates');
    const wordTemplate = "ND Techno Solutions Quotation.docx"
    const templatePath = path.join(templatesDir, wordTemplate);
    if (!fs.existsSync(templatePath)) {
        return res.status(404).send("Template not found.");
    }
    fs.readFile(templatePath, 'binary', (err, data) => {
        if (err) return res.status(500).send("Error reading template file.");
        const zip = new PizZip(data);
        const doc = new docxtemplater(zip);
        doc.render({
            inverterCapacity: inverterCapacity, //
            inverterBrand: inverterBrandName, //
            panelCapacity: panelCapacity, //
            panelBrand: panelBrandName, //
            panelType: panelType, //
            NoOfPanels: noOfPanels, //
            connectionType: connectionType, //
            roofType: roofType, //
            connectedLoad: connectedLoad, //
            netCapacity: netCapacity, //
            contactEmail: contactEmail, //
            contactNo: contactNo, //
            customerName: customerName, //
            phase: phase, //
            netCost: netCost,
            units: units, //
            baseCost: baseCost, //
            tax: tax, //
        });
        const docxPath = path.join(outputDir, wordTemplate);
        fs.writeFileSync(docxPath, doc.getZip().generate({ type: 'nodebuffer' }));
        res.setHeader("Content-Type", "application/json");
        res.json({ previewLink: `/preview?file=${encodeURIComponent(wordTemplate)}&type=docx` });
    });
}

module.exports = { generateFile, previewFile, generateQuotation };
