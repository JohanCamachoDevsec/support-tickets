# Soporte de Tickets - Prueba Técnica Maja Sportswear 🎫

Este repositorio contiene mi solución a la prueba técnica.
El objetivo es implementar un sistema de gestión de tickets de soporte que
permita evaluar el análisis, manejo de datos (CRUD)
y la gestión de flujos de trabajo con cambios
de estado y auditoría.

## stack elegido

- **Backend:** Node.js, Express, TypeScript y TypeORM.
- **Frontend:** React con TypeScript.
- **Base de Datos:** PostgreSQL 17.
- **Infraestructura:** Docker.

##  Estructura del Proyecto

El proyecto sigue una estructura limpia y modular para facilitar el mantenimiento:

## Características Técnicas

### Tipado Estructural y Seguridad
Se evita el uso de `any` en toda la base de código. Cada entidad y transferencia de datos está estrictamente tipada, utilizando interfaces y clases de TypeScript para garantizar la robustez del sistema desde la fase de desarrollo.

##  Instalación y Despliegue

### Requisitos Previos
- Docker y Docker Compose instalados.
- Node.js (v18 o superior).

### Pasos para levantar el entorno:

##  Roles y Flujos de Trabajo
El sistema está diseñado para soportar tres niveles de acceso principales:
- **ADMIN:** Supervisión total del sistema.
- **AGENT:** Gestión activa y resolución de tickets.
- **CLIENT:** Usuario final con capacidad de reportar incidentes.

---
## Estados de los tickets
abierto
en proceso
cerrado
reabierto

