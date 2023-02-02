const express = require('express');
const router = express.Router();

const { testFollow } = require('../controller/follow');


// Definicion de rutas
router.get('/prueba-follow', testFollow);

module.exports = router;