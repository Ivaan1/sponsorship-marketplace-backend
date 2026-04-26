# 🎟️ Sponsorship Marketplace - Backend API

Backend (API REST) para el **Sponsorship Marketplace**, una plataforma B2B desarrollada como parte del reto académico de la U-TAD en colaboración con Eventbrite.

Nuestra plataforma conecta **Marcas (Sponsors)** con **Creadores de Eventos**, permitiendo a las marcas invertir de forma inteligente basándose en datos reales de audiencia gracias a nuestro algoritmo **Sponsor Fit Score**.

## 🎯 Características Principales (MVP)

* **Gestión de Usuarios (Roles):** Autenticación diferenciada para Marcas (`sponsor`) y Creadores (`event_creator`).
* **Sponsor Fit Score:** Motor de cruce de datos entre el Target Audience del Sponsor y la demografía real del Evento.
* **Catálogo de Patrocinios:** Gestión de Sponsorship Packages (Tiers) vinculados a eventos específicos.
* **Arquitectura Escalable:** Patrón MVC (Model-View-Controller) preparado para integrarse en el futuro con la API real de Eventbrite.
* **Perfil de Usuario estilo Eventbrite:** Creación y gestión de perfiles enriquecidos para Sponsors y Creadores, inspirados en la experiencia de Eventbrite.
* **Flujo de Creación de Eventos:** Proceso guiado de creación de eventos replicando el flujo de Eventbrite, incluyendo campos adicionales de demografía y características relevantes para optimizar el matching con sponsors.
* **Motor de Búsqueda Mejorado:** Búsqueda avanzada de eventos con filtros basados en los datos demográficos, categoría, ubicación y demás atributos del evento para un matching más preciso.
* **Dashboard del Creador de Eventos:** Vista centralizada donde el creador puede gestionar sus eventos y acceder a un mailbox con las propuestas e interacciones de sponsors interesados en cada evento.

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura limpia MVC:

```
📁 src
 ┣ 📂 config       # Conexión a MongoDB (mongo.js)
 ┣ 📂 controllers  # Lógica de negocio (auth.js, users.js, events.js)
 ┣ 📂 models       # Esquemas de Mongoose (user.js, event.js, index.js)
 ┣ 📂 routes       # Definición de endpoints y enrutador dinámico (index.js)
 ┣ 📂 utils        # Funciones reutilizables (Manejo de errores, JWT, etc.)
 ┣ 📂 validators   # Middlewares de validación de datos (express-validator)
 ┗ 📜 app.js       # Archivo principal de configuración de Express
```

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

Al iniciar correctamente, la API queda disponible en:
- `http://localhost:3000` (o el `PORT` configurado)
- `http://localhost:3000/api-docs` para Swagger
