const express = require('express');
const path = require('path');
const panelRoutes = require('./routes/panelRoutes');
const inverterRoutes = require('./routes/inverterRoutes');
const erectionRoutes = require('./routes/erectionRoutes');
const docxRoutes = require('./routes/docxRoutes');
const userRoutes = require('./routes/userRoutes.js');

const app = express();
const port = process.env.PORT || 3000;
// const BACKEND_URL = process.env.BACKEND_URL || "";w
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', panelRoutes);
app.use('/', inverterRoutes);
app.use('/', erectionRoutes);
app.use('/', docxRoutes);
app.use('/', userRoutes);
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(port, () => {
    console.log(`Server running on PORT: ${port}`);
});