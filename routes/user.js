const express = require('express');
const router  = express.Router();

//const UserControler = require('../controller/user');
const { 
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

module.exports = router;