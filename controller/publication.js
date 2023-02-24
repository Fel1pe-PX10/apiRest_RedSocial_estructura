// Importar Modulos
const fs   = require('fs');
const path = require('path');

// Importar modelos
const Publication = require('../models/publication');

// Importar servicios
const followServices = require('../services/followService');

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

// Subir ficheros
const upload = (req, res) => {

    // Obtener el id de la publicacion a subir el archivo
    const publicationId = req.params.publicationId;

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

    

    Publication.findOneAndUpdate({user:req.user.id, _id:publicationId}, {file: req.file.filename}, {new:true}, (err, publicationUpdate) => {

        if(err){
            return res.status(500).json({
                status: 'error',
                message: 'Error guardando la imagen en la DB'
            });
        }

        if(publicationUpdate){
            return res.json({
                status: 'success',
                publicationUpdate,
                file: req.file
            });
        }
    });
}

// Devolver archivos multimedia imagenes
const getMedia = (req, res) => {

    // Sacar parametro url
    const file = req.params.file;

    // Montar el path real de la imagen
    const filePath = './uploads/publications/'+file;

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

// Listar todas las publicaciones (FEED)
const feed = async(req, res) => {
    // Obtener pagina actual
    const page = (!req.param.page) ? 1 : req.param.page;

    // Establecer numero de elementos por pagina
    const itemsPerPage = 5;
    
    try {
        // Obtener array de identificadores de usuarios que yo sigo como usuario logueado
        const myFollows = await followServices.followUserIds(req.user.id);
    
        // Find a las publicaciones (in, order, popular, paginar)

        const [publications, total] = await Promise.all([
            Publication.find({user: myFollows.following})
                .populate('user', '-password -role -__v -email')
                .sort('-create_at')
                .paginate(page, itemsPerPage), 
            Publication.countDocuments({user: myFollows.following})
        ]) 

        return res.status(200).json({
            status: 'success',
            page,
            itemsPerPage,
            total,
            pages: Math.ceil(total/itemsPerPage),
            follows: myFollows.following,
            publications
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: 'error',
            message: 'Error consultando la lista de seguidores'
        });
    }


    
    
}

module.exports = {
    deletePublication,
    feed,
    getMedia,
    listPublications,
    publicationOne,
    save,
    testPublication,
    upload
}