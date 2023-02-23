const express = require('express');
const router = express.Router();

const multer = require('multer');
// Configuracion subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/publications/')
    },
    filename: (req, file, cb) => {
        cb(null, 'pub-'+Date.now()+'-'+file.originalname)
    }
})
// Middleware de uploads
const updloads = multer({storage});

const auth = require('../middlewares/auth');

const { testPublication, save, publicationOne, deletePublication, listPublications, upload, getMedia } = require('../controller/publication');

// Definicion de rutas
router.get('/prueba-publication', testPublication);
router.post('/save', [auth], save);
router.get('/detail/:id', [auth], publicationOne);
router.delete('/delete/:id', [auth], deletePublication);
router.get('/listPublications/:user/:page?', [auth], listPublications);
router.post('/upload/:publicationId', [auth, updloads.single('file0')], upload);
router.get('/media/:file', [auth], getMedia);

module.exports = router;