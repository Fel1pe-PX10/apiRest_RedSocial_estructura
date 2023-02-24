const bcrypt             = require('bcrypt');
const mongoosePagination = require('mongoose-pagination');

const fs = require('fs');
const path = require('path');

const Follow       = require ('../models/follow');
const Publications = require('../models/publication');
const User         = require('../models/user');

const { createToken } = require('../helper/jwt');

const { followUserIds, followThisUser } = require('../services/followService');



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

    // Informacion de seguieminto
    const followInfo = await followThisUser(req.user.id, id);

    return res.json({
        status: 'success',
        message: 'Profile',
        userDB,
        following: followInfo.following,
        follower: followInfo.follower
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

    // Sacar un array de ids de los usuarios que me siguen y los que sigo como victor
    const followsUserIds = await followUserIds(req.user.id);

    return res.json({
        status: 'success',
        message: 'Pagination',
        list,
        page,
        itemsPerPage,
        total,
        pages: Math.ceil(total/itemsPerPage),
        folliwing: followsUserIds.following,
        folliwing_me: followsUserIds.followers
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
    else{
        delete userToUpdate.password;
    }

    // Buscar y actualizar
    await User.findByIdAndUpdate(userIdentity.id, userToUpdate, {new: true});

    return res.json({
        status: 'success',
        message: 'Update',
        user: userToUpdate
    });
}

const upload = (req, res) => {

    // Recoger el archivo y comprobar que existe
    if(!req.file){
        return res.status(404).json({
            status: 'error',
            message: 'No existe un archivo tipo imagen'
        });
    }

    // Conseguir el nombre del archivo
    const image = req.file.originalname;

    // Sacar extensión y comprobar, si es correcta guardar archivo. Si no es correcta borrar archivo
    const imageSplit = image.split('\.');
    const extension = imageSplit[1];

    

    if(extension != 'png' && extension != 'jpg' && extension != 'jpeg' && extension != 'gif'){

        const filePath = req.file.path;

        fs.unlinkSync(filePath);

        return res.status(400).json({
            status: 'error',
            message: 'Formato de imagen no soportado'
        });
    }

    

    User.findOneAndUpdate({_id:req.user.id}, {image: req.file.filename}, {new:true}, (err, userUpdate) => {

        if(err){
            return res.status(500).json({
                status: 'error',
                message: 'Error guardando la imagen en la DB'
            });
        }

        if(userUpdate){
            return res.json({
                status: 'success',
                userUpdate
            });
        }
    });
}

const getAvatar = (req, res) => {

    // Sacar parametro url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = './uploads/avatars/'+file;

    // comprobar que existe y devolver file
    fs.stat(filePath, (err, exist) => {
        
        if(!exist){
            return res.status(404).json({
                status: 'error',
                message: 'No existe imagen'
            });
        }

       return res.sendFile(path.resolve(filePath));
    })

    
}

const counters = async(req, res) => {
    
    const userId = (!req.params.id) ? req.user.id : req.params.id;
    
    try {
        const following = await Follow.count({user: userId});

        const followed = await Follow.count({followed: userId});

        const publications = await Publications.count({user: userId});

        return res.json({
            status: 'success',
            following,
            followed,
            publications
        });


    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: 'error',
            message: 'Error al consultar estadisticas de counters'
        });
    }
}

module.exports = {
    counters,
    list,
    login,
    getAvatar,
    profile,
    register,
    testUser,
    update,
    upload
}