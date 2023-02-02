// Importacion de dependencias
const conn      = require('./db/conn');
const express   = require('express');
const cors      = require('cors');

// Mensaje de bienvenida
console.log('Api NODE para red social');

// Conn bd
conn();

// servidor
const app = express();
const puerto = 3900;

// Cors
app.use(cors());

// Convertir datos a objetos js
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Cargar rutas
const followRoutes      = require('./routes/follow');
const publicationRoutes = require('./routes/publication');
const userRoutes        = require('./routes/user');

app.use('/api/follow', followRoutes);
app.use('/api/publication', publicationRoutes);
app.use('/api/user', userRoutes);

app.get('/ruta-prueba', (req, res) => {
    return res.json({
        status: true,
        mensaje: 'ruta de prueba'
    })
})

// Poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log('Servidor de node corriendo en el puerto', puerto);
})