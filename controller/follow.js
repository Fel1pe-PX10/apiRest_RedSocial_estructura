// Dependencias
const mongoosePaginate = require('mongoose-pagination');

// Modelos
const Follow = require('../models/follow');
const User   = require('../models/user');

const { followUserIds } = require('../services/followService');

// Acciones de prueba
const testFollow = (req, res) => {
    return res.json({
        mensaje: 'Mensaje Follow Controller'
    })
}

// Accion de guardar un follow (empezar a seguir)
const saveFollow = async (req, res) => {
    // Conseguir datos del body
    const params = req.body;

    // Sacar id del usuario identificado
    const identity = req.user;

    // crear objeto con modelo follow
    const userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    // Guardar objeto
    try {
        await userToFollow.save();
        
        return res.json({
            status: 'success',
            message: 'New Followed',
            identity: req.user
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: 'error',
            message: 'Error Followed'
        });
    }

    
}

// Accion de borrar un follow (dejar de seguir)
const unfollow = async (req, res) => {
    // Obtener el id del usuario identificado
    const userId = req.user.id;

    // Obtener id del usuario a dejar de seguir
    const idToUnfollow = req.params.id;
    
    // Obtener coincidencias y hacer remove
    const resultado = await Follow.findOneAndRemove({ $and: [
                                {'user': userId},
                                {'followed': idToUnfollow}
                            ]
                        });

    if(!resultado){
        return res.status(500).json({
            status: 'error',
            message: 'Error, no se puede dejar de seguir'
        });
    }

    return res.status(200).json({
        status: 'success',
        message: 'Unfollow Success '
    });
}

// Accion listar usuarios que cualquir usuaro está siguiendo (siguiendo)
const FollowingList = async(req, res) => {

    // Obtener el id del usuario identificado si llega un parametro asignarlo a esa constante
    const userId = (req.param.id) ? req.param.id : req.user.id;

    // Comprobar si me llega la pagina, si no dejar la pagina 1
    const page = (req.params.page) ? req.params.page : 1;

    // Usuarios por pagina a mostrar
    const userPerPage = 5;

    // Find a follow, popular datos de los usuarios y paginar con mongoose paginate
    const [total, follows] = await Promise.all([
        Follow.countDocuments(),
        Follow.find({user: userId})
                                .populate('user followed', '-password -role -__v')
                                .paginate(page, userPerPage)
    ]);
    
    if(follows.length === 0){
        return res.status(200).json({
            status: 'success',
            message: 'No se está siguiendo a nadie'
        });
    }

    // Sacar un array de ids de los usuarios que me siguen y los que sigo como victor
    const followsUserIds = await followUserIds(req.user.id);


    return res.status(200).json({
        status: 'success',
        message: 'Followin list ',
        folliwing: followsUserIds.following,
        folliwing_me: followsUserIds.followers,
        follows,
        total,
        pages: Math.ceil(total/userPerPage)
    });
}

// Accion listar de usuarios que siguen a cualquier otro usuario (seguidores)
const FollowersList = async (req, res) => {
    // Obtener el id del usuario identificado si llega un parametro asignarlo a esa constante
    const userId = (req.param.id) ? req.param.id : req.user.id;

    // Comprobar si me llega la pagina, si no dejar la pagina 1
    const page = (req.params.page) ? req.params.page : 1;

    // Usuarios por pagina a mostrar
    const userPerPage = 5;

    // Find a follow, popular datos de los usuarios y paginar con mongoose paginate
    const [total, followers] = await Promise.all([
        Follow.countDocuments(),
        Follow.find({followed: userId})
                                .populate('user followed', '-password -role -__v')
                                .paginate(page, userPerPage)
    ]);
    
    if(followers.length === 0){
        return res.status(200).json({
            status: 'success',
            message: 'No se está siguiendo a nadie'
        });
    }

    // Sacar un array de ids de los usuarios que me siguen y los que sigo como victor
    const followsUserIds = await followUserIds(req.user.id);

    return res.status(200).json({
        status: 'success',
        message: 'Followers list ',
        followers,
        total,
        pages: Math.ceil(total/userPerPage),
        folliwing: followsUserIds.following,
        folliwing_me: followsUserIds.followers,
    });
}

module.exports = {
    FollowingList,
    FollowersList,
    testFollow,
    saveFollow,
    unfollow,
}