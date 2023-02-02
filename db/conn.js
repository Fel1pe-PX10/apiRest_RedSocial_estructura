
const mongoose = require('mongoose');

const connection = async () => {
    try {

        mongoose.set('strictQuery', false);
        
        await mongoose.connect('mongodb+srv://mongo:6M72Ysskg8JLD484@cluster0.tgqhl.mongodb.net/RedSocialApiRest');

        console.log('Conexión a la DB');

    } catch (error) {
        console.log(error);
        throw new Error('No se ha podido conectar a la DB');
    }
}

module.exports = connection;