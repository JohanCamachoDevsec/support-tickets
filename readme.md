# Soporte de Tickets - Prueba Técnica Maja Sportswear 🎫

Este repositorio contiene la solución a la prueba técnica para el sistema de gestión de tickets de soporte. El objetivo es proporcionar una plataforma robusta que permita el manejo del ciclo de vida de incidencias, auditoría automática y control de acceso basado en roles (RBAC).

## Stack Tecnológico

- **Backend:** Node.js, Express (v5.x), TypeScript, TypeORM.
- **Frontend:** React con TypeScript.
- **Base de Datos:** PostgreSQL 17.
- **Seguridad/Validación:** JWT, BcryptJS, Zod, class-validator.
- **Infraestructura:** Docker y Docker Compose.

## Estructura del Proyecto

El proyecto se divide en dos directorios principales para separar la lógica del servidor y la interfaz de usuario:

### Backend (`/backend`)
- `src/entities`: Modelos de TypeORM (Ticket, User, TicketComment, TicketHistory).
- `src/services`: Lógica de negocio y reglas de validación de flujo (Máquina de Estados).
- `src/controllers`: Manejadores de peticiones HTTP.
- `src/middlewares`: Capas de seguridad (AuthMiddleware) y procesamiento.
- `src/routes`: Definición de endpoints de la API.
- `src/validations`: Esquemas de validación de entrada con Zod/class-validator.
- `src/subscribers`: Listeners de eventos para auditoría automática de cambios.
- `src/config`: Configuración de base de datos y entorno.

### Frontend (`/frontend`)
- Estructura estándar de React con TypeScript para la interfaz de gestión.

## Máquina de Estados (Ciclo de Vida)

El sistema implementa un grafo de estados determinista para garantizar la integridad del flujo de trabajo:

1. **OPEN**: Estado inicial al crear un ticket. Transición permitida a: `IN_PROGRESS`.
2. **IN_PROGRESS**: El personal de soporte está trabajando. Transición permitida a: `CLOSED`.
3. **CLOSED**: El problema ha sido resuelto. Transición permitida a: `REOPENED`.
4. **REOPENED**: El cliente solicita reabrir el caso. Transición permitida a: `IN_PROGRESS` o `CLOSED`.

### Seguridad y Roles (RBAC)
- **CLIENT**: Puede crear tickets, comentarlos y reabrirlos (si están cerrados). Solo ve sus propios tickets.
- **AGENT**: Puede gestionar tickets asignados, cambiar estados y añadir comentarios internos.
- **ADMIN**: Control total del sistema, gestión de usuarios, asignación de tickets y edición de prioridades.

## Instalación y Despliegue

### Requisitos Previos
- Docker y Docker Compose instalados.
- Node.js (v18 o superior).

### Pasos para levantar el entorno:

## Pruebas y Validación

El sistema incluye una suite de pruebas para validar la robustez de la lógica de negocio y las restricciones de seguridad:

- `npm run test-db`: Valida la conexión y esquemas de base de datos.
- `npm run test-auth`: Prueba el flujo de registro y autenticación JWT.
- `npm run test-ticket`: Valida la creación y flujo básico de tickets.
- `npm run test-violations`: Verifica que se respeten las restricciones de la máquina de estados y privacidad (ej: un cliente no puede ver tickets ajenos ni saltarse estados).

## Auditoría
Gracias a los `Subscribers` de TypeORM, cada cambio significativo en un ticket (estado, prioridad, asignación) genera automáticamente una entrada en la tabla `TicketHistory`, registrando qué usuario realizó el cambio y en qué fecha.

