import swaggerJsdoc from 'swagger-jsdoc'
const port = process.env.PORT || 3000; 

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sponsorship Marketplace API',
            version: '1.0.0',
            description: 'Documentación de la API',
        },
        servers: [
            { url: `http://localhost:${port}/api` }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                }
            }
        }
    },
    apis: ['./src/docs/*.js'], // ← apunta a la carpeta docs
}

export default swaggerJsdoc(options)