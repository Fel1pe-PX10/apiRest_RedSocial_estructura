// Acciones de prueba
const testPublication = (req, res) => {
    return res.json({
        mensaje: 'Mensaje Publication Controller'
    })
}

module.exports = {
    testPublication
}