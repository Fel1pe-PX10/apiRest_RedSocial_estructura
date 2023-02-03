
const jwt    = require('jwt-simple');
const moment = require('moment');

const key = 'Clave_Secreta_Proyecto_Red_Social_adsf*342s';

// Crear funcion para generar tokens
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        nick: user.nick,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, 'days').unix()
    }

    // Devolver jwt token codificado
    return jwt.encode(payload, key);
}

module.exports = {
    createToken,
    key
};