const express = require('express');
const router = express.Router();

const { testPublication } = require('../controller/publication');

// Definicion de rutas
router.get('/prueba-publication', testPublication);

module.exports = router;