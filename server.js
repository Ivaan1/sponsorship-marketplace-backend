require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Conectar a Base de Datos
// connectDB(); // Descomentar cuando tengas MongoDB listo

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API Sponsorship Marketplace funcionando correctamente ??' });
});

// Definir Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(\Servidor corriendo en modo \ en el puerto \\);
});
