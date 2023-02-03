const bcrypt             = require('bcrypt');
const mongoosePagination = require('mongoose-pagination');

const User = require('../models/user');

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

const profile = async (req, res) => {
    // recibir parametro del id de usuario por la url
    const id = req.params.id;

    // Consultar datos usuario
    const userDB = await User.findById(id).select({ password: 0, role: 0 });
    if(!userDB){
        return res.status(404).json({
            status: 'error',
            message: 'Usuario no existe'
        });
    }

    return res.json({
        status: 'success',
        message: 'Profile',
        userDB
    });
}

const list = async (req, res) => {
    // Controlar pagina actual
    let page = (req.params.page) ? parseInt(req.params.page) : 1;

    // Consulta con mongoose pagination
    const itemsPerPage = 5;
    const [total, list] = await Promise.all([
        User.countDocuments(),
        User.find().sort('_id').paginate(page, itemsPerPage)
    ])

    return res.json({
        status: 'success',
        message: 'Pagination',
        list,
        page,
        itemsPerPage,
        total,
        pages: Math.ceil(total/itemsPerPage)
    });
}

const update = async (req, res) => {

    // Cargar informacion del usuario que está en el req
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Eliminar datos que no son requeridos
    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    
    // Comprobar que el usuario existe
    const usuarioDB = await User.find({ $or: [
        {email: userToUpdate.email.toLowerCase()},
        {nick: userToUpdate.nick.toLowerCase()}
    ]});

    let userIsset = false;
    usuarioDB.forEach(user => {
        if(user && user._id != userIdentity.id)
            userIsset = true;
    })

    if(userIsset){
        return res.status(400).json({
            status: 'error',
            message: 'Usuario ya existe'
        });
    }
    // Si llega password, cifrarla
    if(userToUpdate.password){
        const pwd = await bcrypt.hash(userToUpdate.password, 10);
        userToUpdate.password = pwd;
    }

    // Buscar y actualizar
    await User.findByIdAndUpdate(userIdentity.id, userToUpdate, {new: true});

    return res.json({
        status: 'success',
        message: 'Update',
        user: userToUpdate
    });
}



module.exports = {
    testUser,
    register,
    login,
    profile,
    list,
    update
}