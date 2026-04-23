import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import dbConnect from './config/mongo.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import routes from './routes/index.js'

dotenv.config() // Siempre lo primero

const app = express();

//MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)) // ← añade esto


// CARGA DE RUTAS
app.use('/api', routes) // Lee routes/index.js

// PUERTO Y ARRANQUE
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Servidor corriendo en http://localhost:" + port);
    dbConnect();
});