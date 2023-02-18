const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');

const { testFollow, saveFollow, unfollow, FollowinList, FollowersList } = require('../controller/follow');


// Definicion de rutas
router.get('/prueba-follow', testFollow);
router.post('/save-follow', [auth], saveFollow);
router.delete('/unfollow/:id', [auth], unfollow);
router.get('/following/:id?/:page?', [auth], FollowinList);
router.get('/followers/:id?/:page?', [auth], FollowersList);

module.exports = router;