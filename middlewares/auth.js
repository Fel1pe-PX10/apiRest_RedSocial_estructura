const jwt    = require('jwt-simple');
const moment = require('moment');

// Importar clave secreta
const { key } = require('../helper/jwt');

// funcion de auteticacion
const auth = (req, res, next) => {
    // comprobar cabecera
    if(!req.headers.authorization){
        return res.status(400).json({
            status: 'error',
            message: 'La petición no tiene la cabecera de autenticación'
        });
    }

    // limpiar token
    const token = req.headers.authorization.replace(/['"]+/g, '');

    // Decodificar token
    try {
        const payload = jwt.decode(token, key);

        // Comprobar expiración token
        if(payload.exp <= moment().unix()){
            return res.status(401).json({
                status: 'error',
                message: 'Token expirado'
            });
        }

        // Agregar datos de usuario a request
        req.user = payload;

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: 'error',
            message: 'Token invalido'
        });
        
    }
    
    // Pasar a ejecución de accion
    next();
}

module.exports = auth;
