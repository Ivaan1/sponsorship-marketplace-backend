import swaggerJsdoc from 'swagger-jsdoc'
const port = process.env.PORT || 3000; 

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Sponsorship Marketplace API',
            version: '1.0.0',
            description: `
API del marketplace de patrocinios entre **creators** (organizadores de eventos) y **sponsors** (marcas).

### Autenticación
1. \`POST /auth/register\` o \`POST /auth/login\` → obtén el JWT.
2. En Swagger UI, pulsa **Authorize** e introduce: \`Bearer <tu_token>\`.

### Flujos principales
- **Sponsor**: registro → onboarding (\`PATCH /users/onboarding\`) → catálogo (\`GET /events\`) → aplicar (\`POST /events/:id/apply\`).
- **Creator**: registro → crear evento (\`POST /events\`) → publicar (\`PATCH /events/:id/onboarding\`) → gestionar solicitudes (\`PATCH /events/:id/applications/:appId\`).
            `.trim(),
        },
        tags: [
            { name: 'Auth', description: 'Registro e inicio de sesión' },
            { name: 'Users', description: 'Perfil y onboarding' },
            { name: 'Events', description: 'Eventos y patrocinios' },
        ],
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