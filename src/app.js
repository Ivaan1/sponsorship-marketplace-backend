require('dotenv').config(); // Siempre lo primero
const express = require("express");
const cors = require("cors");
const dbConnect = require('./config/mongo');

const app = express();

//MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

// CARGA DE RUTAS
app.use("/api", require("./routes")); // Lee routes/index.js

// PUERTO Y ARRANQUE
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Servidor corriendo en http://localhost:" + port);
    dbConnect();
});