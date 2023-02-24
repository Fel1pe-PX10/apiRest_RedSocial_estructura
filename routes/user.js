const express = require('express');

const multer = require('multer');

// Configuracion subida multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars/')
    },
    filename: (req, file, cb) => {
        cb(null, 'avatar-'+Date.now()+'-'+file.originalname)
    }
})
// Middleware de uploads
const updloads = multer({storage});

const router  = express.Router();

//const UserControler = require('../controller/user');
const { 
    list, 
    login, 
    profile,
    register, 
    testUser,
    update,
    upload,
    getAvatar,
    counters
} = require('../controller/user');

const auth = require('../middlewares/auth');



// Definicion de rutas
router.get('/prueba-usuario', [auth], testUser);
router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', [auth], profile);
router.get('/list/:page?', [auth], list);
router.put('/update', [auth], update);
router.post('/upload', [auth, updloads.single('file0')], upload);
router.get('/avatar/:file', [auth], getAvatar);
router.get('/counters/:id?', [auth], counters);


module.exports = router;