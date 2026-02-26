# 🎟️ Sponsorship Marketplace - Backend API

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

Backend (API REST) para el **Sponsorship Marketplace**, una plataforma B2B desarrollada como parte del reto académico de la **U-TAD en colaboración con Eventbrite**. 

Nuestra plataforma conecta **Marcas (Sponsors)** con **Creadores de Eventos**, permitiendo a las marcas invertir de forma inteligente basándose en datos reales de audiencia gracias a nuestro algoritmo *Sponsor Fit Score*.

---

## 🎯 Características Principales (MVP)

- **Gestión de Usuarios (Roles):** Autenticación diferenciada para Marcas (`sponsor`) y Creadores (`event_creator`).
- **Sponsor Fit Score:** Motor de cruce de datos entre el *Target Audience* del Sponsor y la demografía real del Evento.
- **Catálogo de Patrocinios:** Gestión de *Sponsorship Packages* (Tiers) vinculados a eventos específicos.
- **Arquitectura Escalable:** Patrón MVC (Model-View-Controller) preparado para integrarse en el futuro con la API real de Eventbrite.

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura limpia MVC:

```text
📁 src
 ┣ 📂 config       # Conexión a MongoDB (mongo.js)
 ┣ 📂 controllers  # Lógica de negocio (auth.js, users.js, events.js)
 ┣ 📂 models       # Esquemas de Mongoose (user.js, event.js, index.js)
 ┣ 📂 routes       # Definición de endpoints y enrutador dinámico (index.js)
 ┣ 📂 utils        # Funciones reutilizables (Manejo de errores, JWT, etc.)
 ┣ 📂 validators   # Middlewares de validación de datos (express-validator)
 ┗ 📜 app.js       # Archivo principal de configuración de Express
