const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

const { testPublication, save, publicationOne, deletePublication, listPublications } = require('../controller/publication');

// Definicion de rutas
router.get('/prueba-publication', testPublication);
router.post('/save', [auth], save);
router.get('/detail/:id', [auth], publicationOne);
router.delete('/delete/:id', [auth], deletePublication);
router.get('/listPublications/:user/:page?', [auth], listPublications);

module.exports = router;