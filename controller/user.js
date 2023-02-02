const bcrypt = require('bcrypt');
const user = require('../models/user');

const User = require('../models/user');
const { param } = require('../routes/user');

const { createToken } = require('../helper/jwt');



// Acciones de prueba
const testUser = (req, res) => {
    return res.json({
        mensaje: 'Mensaje User Controller'
    })
}

// Registro de usuario
const register = async (req, res) => {

    // Datos de la peticion
    const params = req.body;

    // Comprobar datos (validacion)
    if( !params.name || !params.email || !params.password || !params.nick)
        return res.status(400).json({
            status: 'error',
            message: 'Error de datos'
        });

    // Crear objeto de usuario
    const userToSave = new User(params)

    // Control usuarios duplicados
    const usuarioDB = await User.find({ $or: [
        {email: userToSave.email.toLowerCase()},
        {nick: userToSave.nick.toLowerCase()}
    ]});

    if(usuarioDB.length > 0){
        return res.status(400).json({
            status: 'error',
            message: 'Usuario ya existe'
        });
    }

    // Cifrar contraseña
    const pwd = await bcrypt.hash(userToSave.password, 10);
    userToSave.password = pwd;

    // Guardr en DB
    await userToSave.save((err, resultSave) => {
        if(err){
            console.log(err);

            return res.json({
                status: 'error',
                message: 'Erro al guardar el usuario'
            });
        }
        else{
            return res.json({
                status: 'success',
                message: 'registro de usuario',
                resultSave
            });
        }
    });
}

const login = async (req, res) => {

    // Recoger parametros
    const params = req.body;

    if( !params.email || !params.password)
        return res.status(400).json({
            status: 'error',
            message: 'Error de datos'
        });

    // Buscar email en la bd
    const userDB = await User.findOne({email: params.email});
    if(!userDB){
        return res.status(400).json({
            status: 'error',
            message: 'Usuario no existe'
        });
    }

    // Validar contraseña
    const loginOk = await bcrypt.compareSync(params.password, userDB.password);
    if(!loginOk){
        return res.status(400).json({
            status: 'error',
            message: 'Credenciales invalidas'
        });
    }
    // jwt
    const token = createToken(userDB);

    // Devolver datos usuarios
    return res.json({
        status: 'success',
        message: 'Login exitoso',
        user: {
            _id: userDB._id,
            name: userDB.name,
            email: userDB.email,
            nick: userDB.nick
        },
        token
    });

}

module.exports = {
    testUser,
    register,
    login
}