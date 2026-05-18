# 🎟️ Sponsorship Marketplace - Backend API

Backend (API REST) para el **Sponsorship Marketplace**, una plataforma B2B desarrollada como parte del reto académico de la U-TAD en colaboración con Eventbrite.

Nuestra plataforma conecta **Marcas (Sponsors)** con **Creadores de Eventos**, permitiendo a las marcas invertir de forma inteligente basándose en datos reales de audiencia gracias a nuestro algoritmo **Sponsor Fit Score**.

## 🎯 Características Principales (MVP)

* **Gestión de Usuarios (Roles):** Autenticación diferenciada para Marcas (`sponsor`) y Creadores (`event_creator`).
* **Sponsor Fit Score:** Motor de cruce de datos entre el Target Audience del Sponsor y la demografía real del Evento.
* **Catálogo de Patrocinios:** Gestión de Sponsorship Packages (Tiers) vinculados a eventos específicos.
* **Arquitectura Escalable:** Patrón MVC (Model-View-Controller) estructurado mediante servicios y clases para garantizar una lógica desacoplada, preparado para integrarse en el futuro con la API real de Eventbrite.
* **Perfil de Usuario estilo Eventbrite:** Creación y gestión de perfiles enriquecidos para Sponsors y Creadores, inspirados en la experiencia de Eventbrite.
* **Flujo de Creación de Eventos:** Proceso guiado de creación de eventos replicando el flujo de Eventbrite, incluyendo campos adicionales de demografía y características relevantes para optimizar el matching con sponsors.
* **Motor de Búsqueda Mejorado:** Búsqueda avanzada de eventos con filtros basados en los datos demográficos, categoría, ubicación y demás atributos del evento para un matching más preciso.
* **Dashboard del Creador de Eventos:** Vista centralizada donde el creador puede gestionar sus eventos y acceder a un mailbox con las propuestas e interacciones de sponsors interesados en cada evento.

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura limpia MVC (Model-View-Controller) estructurado mediante servicios y clases para garantizar una lógica desacoplada:

```
📁 src
 ┣ 📂 config       # Conexión a MongoDB (mongo.js)
 ┣ 📂 controllers  # Lógica de negocio (auth.js, users.js, events.js)
 ┣ 📂 models       # Esquemas de Mongoose (user.js, event.js, index.js)
 ┣ 📂 routes       # Definición de endpoints y enrutador dinámico (index.js)
 ┣ 📂 services     # Capa de negocio implementada en Clases (EventRankService)
 ┣ 📂 utils        # Funciones reutilizables (Manejo de errores, JWT, etc.)
 ┣ 📂 validators   # Middlewares de validación de datos (express-validator)
 ┗ 📜 app.js       # Archivo principal de configuración de Express
```

## 🧠 Motor de Matchmaking: Sponsor Fit Score

La plataforma cuenta con un motor de recomendación encapsulado en `EventRankService` que calcula una puntuación de afinidad (`_score`) para cada evento frente al perfil de un sponsor. El algoritmo pondera cuatro dimensiones clave:

- **Coincidencia de categorías:** alineación entre las categorías de interés del sponsor y las del evento.
- **Intersección de tags de patrocinio:** solapamiento entre los tags declarados por la marca y los del evento.
- **Análisis de rangos de presupuesto:** compatibilidad entre el presupuesto del sponsor y los tiers de patrocinio ofrecidos.
- **Filtros demográficos de audiencia:** ajuste entre el target audience del sponsor y la demografía real del evento.

El resultado es un listado de eventos ordenados por relevancia, permitiendo a las marcas descubrir oportunidades de patrocinio con mayor probabilidad de éxito.

## 📋 Plan de Documentación y Cobertura

| Capa del Software | Herramienta / Estándar | Objetivo de Cobertura | Descripción |
|---|---|---|---|
| API Pública | Swagger / OpenAPI 3.0 | 100% de las rutas | Especificación interactiva de todos los endpoints REST. Disponible en `/api-docs`. |
| Lógica Interna | JSDoc | 100% de funciones core, controladores y clases de servicio | Documentación inline del código fuente para facilitar el mantenimiento y la extensibilidad. |
| Arquitectura Macro | Markdown | Guía de infraestructura y flujos de despliegue en READMEs | Documentación de alto nivel sobre estructura, configuración y procesos del proyecto. |

## 🧪 Estrategia de Testing (CI/CD)

El backend dispone de una suite de tests de integración con **Jest** y **Supertest** que valida los flujos principales de la API de extremo a extremo. Esta suite se ejecuta de forma automatizada en **GitHub Actions** (CI) en cada Pull Request, garantizando que ningún cambio introduzca regresiones antes de fusionarse a la rama principal.

## ⚙️ Instalación

### 1) Prerrequisitos

- Node.js 18+ (recomendado 20+)
- npm (incluido con Node.js)
- Instancia de MongoDB local o remota

### 2) Clonar repositorio

```bash
git clone <url-del-repositorio>
cd sponsorship-marketplace-backend
```

### 3) Instalar dependencias

```bash
npm install
```

## 🔐 Configuración de entorno (`.env`)

Crear un archivo `.env` en la raíz del proyecto con estas variables:

```env
PORT=3000
DB_URI=mongodb://localhost:27017/sponsorship_marketplace
SECRET_JWT=tu_clave_secreta_jwt
```

Notas:
- `PORT` es opcional (por defecto `3000`).
- `DB_URI` debe apuntar a tu base de datos MongoDB.
- `SECRET_JWT` se usa para firmar y validar tokens.

## ▶️ Ejecución del proyecto

### Desarrollo (con recarga automática)

```bash
npm run dev
```

### Producción

```bash
npm start
```

### Ejecutar Suite de Tests

```bash
npm run test
```

Al iniciar correctamente, la API queda disponible en:
- `http://localhost:3000` (o el `PORT` configurado)
- `http://localhost:3000/api-docs` para Swagger
