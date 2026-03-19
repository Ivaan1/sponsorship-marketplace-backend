const mongoose = require('mongoose')
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const dbConnect = () => {
    const db_uri = process.env.DB_URI
    mongoose.set('strictQuery', false)
    try {
        mongoose.connect(db_uri)
            .then(() => {
                console.log("Conexión exitosa a la base de datos");
            })
    } catch (error) {
        console.error("Error conectando a la BD: ", error)
    }
    // Listen events
    mongoose.connection.on("connected", () => console.log("Conectado a la BD"))
    mongoose.connection.on("disconnected", () => console.log("Desconectado de la BD")) 
    mongoose.connection.on("error", (error) => console.error("Error de conexión a la BD:", error))
}

module.exports = dbConnect
