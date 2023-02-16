// Modelos
const Follow = require('../models/follow');
const User   = require('../models/user');

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

// Accion listar usuarios que cualquir usuaro está siguiendo

// Accion listar de usuarios que me siguen

module.exports = {
    testFollow,
    saveFollow,
    unfollow
}