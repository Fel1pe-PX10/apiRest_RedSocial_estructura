
const Publication = require('../models/publication');

// Acciones de prueba
const testPublication = (req, res) => {
    return res.json({
        mensaje: 'Mensaje Publication Controller'
    })
}


// Guardar publicacion
const save = async(req, res) => {

    // Recoger datos del body
    const params = req.body;

    // Validar datos
    if(!params.text){
        return res.status(400).json({
            status: 'error',
            mensaje: 'Se debe enviar un texto como mínimo'
        });
    }

    // Crear y rellenar el objeto del modelo
    const newPublication = new Publication(params);
    newPublication.user = req.user.id;
    
    // guardar objeto en la bbdd
    try {
        await newPublication.save();

        return res.json({
            status: 'success',
            mensaje: 'Publicación guardada'
        })

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            status: 'error',
            mensaje: 'Error al momento de guardar publicación'
        })
    }
}

// Sacar Publicacion
const publicationOne = async(req, res) => {

    // Obterner el id de la publicacion
    const publicationId = req.params.id;

    // Buscar publicacion
    const publication = await Publication.findById(publicationId);

    if(!publication){
        return res.status(404).json({
            status: 'error',
            mensaje: 'La publicación no existe'
        })
    }

    return res.json({
        status: 'success',
        mensaje: publication
    });
}

// Eliminar publicacion
const deletePublication = async (req, res) => {

    // Obtener el id de la publicacion
    // Obterner el id de la publicacion
    const publicationId = req.params.id;

    // Eliminar publicacion
    const publication = await Publication.findOneAndDelete({'user': req.user.id, '_id': publicationId});

    if(!publication){
        return res.status(404).json({
            status: 'error',
            mensaje: 'La publicación no se puede eliminar porque no existe o no tiene permisos para hacerlo'
        })
    }

    return res.json({
        status: 'success',
        mensaje: publication
    });
}


// Listar todas las publicaciones de un usuario
const listPublications = async (req, res) => {

    // Obtener el id del usuario
    const userId = req.params.user;

    // Controlar pagina
    const page = (!req.params.page) ? 1 : req.params.page;

    const itemsPerPage = 5;

    // Find, populate, ordenar y paginar
    await Publication.find({user: userId})
                        .sort('-created_at')
                        .populate('user', '-password -__v -role')
                        .paginate(page, itemsPerPage, (error, publications, total) => {

                            if(error || publications.length === 0){
                                return res.status(404).json({
                                    status: 'success',
                                    mensaje: 'No existen publicaciones para ese usuario'
                                });
                            }

                            return res.json({
                                status: 'success',
                                mensaje: 'publications list',
                                page,
                                pages: Math.ceil(total/itemsPerPage),
                                total,
                                publications,
                                
                            });
                        });

    

    
}

// Listar publicaciones 

// Subir ficheros

// Devolver archivos multimedia imagenes


module.exports = {
    deletePublication,
    listPublications,
    publicationOne,
    save,
    testPublication
}