const express = require('express');
const router  = express.Router();

//const UserControler = require('../controller/user');
const { 
    list, 
    login, 
    profile,
    register, 
    testUser,
} = require('../controller/user');

const auth = require('../middlewares/auth');



// Definicion de rutas
router.get('/prueba-usuario', [auth], testUser);
router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', [auth], profile);
router.get('/list/:page?', [auth], list);

module.exports = router;