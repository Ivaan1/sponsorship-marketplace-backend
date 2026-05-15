import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import routes from './routes/index.js'
import { generalLimiter } from './middlewares/rateLimiter.js'

dotenv.config() 

const app = express();

// APLICACIÓN DE LIMITADOR GLOBAL (para todas las rutas)
app.use(generalLimiter);

// MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

// DOCUMENTACIÓN
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// CARGA DE RUTAS
app.use('/api', routes)

export default app;