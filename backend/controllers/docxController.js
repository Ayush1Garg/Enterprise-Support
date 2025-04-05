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

const generateModelAgreement = async (req, res) => {
    const { vendorName, consumer_name, consumer_address } = req.body;
    let vendor_address = "";
    if (vendorName == "Mamta Enterprises") {
        vendor_address = "Near BOI, Jind Road, Kaithal"
    } else if (vendorName == "ND Techno Solutions") {
        vendor_address = "Sector-19, HUDA, Kaithal"
    }
    const template = "ModelAgreement";
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

        doc.render({
            consumer_name: consumer_name,
            consumer_address: consumer_address,
            vendor_name: vendorName,
            vendor_address: vendor_address

        });

        const docxPath = path.join(outputDir, wordTemplate);
        fs.writeFileSync(docxPath, doc.getZip().generate({ type: 'nodebuffer' }));
        res.setHeader("Content-Type", "application/json");
        res.json({ previewLink: `/preview?file=${encodeURIComponent(wordTemplate)}&type=docx` });
    })
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

module.exports = { generateFile, previewFile, generateModelAgreement };