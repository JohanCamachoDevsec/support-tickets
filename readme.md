![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

# Soporte de Tickets - Prueba Técnica Maja Sportswear

## Demo
Ver aplicación en vivo(https://soportetickets.johandevsec.com)

Este repositorio contiene la solución a la prueba técnica para el sistema de gestión de tickets de soporte. El objetivo es proporcionar una plataforma robusta que permita el manejo del ciclo de vida de incidencias, auditoría automática y control de acceso basado en roles (RBAC).

## Stack Tecnológico

- **Backend:** Node.js, Express (v5.x), TypeScript, TypeORM.
- **Frontend:** React 18 (Vite), TypeScript, Tailwind CSS, Shadcn/UI, TanStack Query.
- **Base de Datos:** PostgreSQL 17.
- **Seguridad/Validación:** JWT, Zod, React Hook Form.
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
- `src/components`: Biblioteca de componentes atómicos y compuestos (basados en Radix UI).
- `src/hooks`: Gestión de peticiones asíncronas y caché mediante TanStack Query.
- `src/lib`: Cliente Axios configurado con interceptores para inyección automática del JWT.
- `src/pages`: Enrutamiento y vistas de la aplicación (Login, Lista de Tickets, Detalle).
- `src/services`: Definiciones de endpoints y transformación de datos.
- `src/types`: Definiciones de tipos compartidas que reflejan los modelos del backend.

## Máquina de Estados (Ciclo de Vida)

El sistema implementa un grafo de estados determinista para garantizar la integridad del flujo de trabajo:

1. **OPEN**: Estado inicial al crear un ticket. Transición permitida a: `IN_PROGRESS`.
2. **IN_PROGRESS**: El personal de soporte está trabajando. Transición permitida a: `CLOSED`.
3. **CLOSED**: El problema ha sido resuelto. Transición permitida a: `REOPENED`.
4. **REOPENED**: El cliente solicita reabrir el caso. Transición permitida a: `IN_PROGRESS`.

### Seguridad y Roles (RBAC)
- **CLIENT**: Puede crear tickets, comentarlos y reabrirlos (si están cerrados). Solo ve sus propios tickets.
- **AGENT**: Puede gestionar tickets asignados, cambiar estados y añadir comentarios internos y edición de prioridades.
- **ADMIN**: Control total del sistema, gestión de usuarios, asignación de tickets y edición de prioridades.

## Instalación y Despliegue

### Requisitos Previos
- Docker y Docker Compose instalados.
- Node.js (v20 o superior) - Solo si se desea desarrollo local.

### Pasos para levantar el entorno con Docker:

1.  **Clonar el repositorio:**
    ```bash
    git clone [url-del-repo]
    cd support-tickets
    ```

2.  **Configurar variables de entorno:**
    Copia el archivo de ejemplo `.env.example`, el cual contiene comentarios detallados sobre el propósito de cada variable, y ajusta los valores (especialmente `JWT_SECRET` y credenciales de BD si se desea personalizarlas).
    ```bash
    cp .env.example .env
    ```

3.  **Construir y levantar contenedores:**
    ```bash
    docker compose up --build
    ```

4.  **Acceder a la aplicación:**
    La aplicación estará disponible en `http://localhost`. El proxy de Nginx se encargará de redirigir el tráfico al frontend y las peticiones `/api` al backend.

### Desarrollo Local (sin Docker)

Si prefieres trabajar fuera de contenedores:
1.  **Backend:** `cd backend && npm install && npm run dev`
2.  **Frontend:** `cd frontend && npm install && npm run dev`
*(Nota: Requiere una instancia de PostgreSQL corriendo localmente).*

## Pruebas y Validación

El sistema incluye una suite de pruebas para validar la robustez de la lógica de negocio y las restricciones de seguridad:

- `npm run test-db`: Valida la conexión y esquemas de base de datos.
- `npm run test-auth`: Prueba el flujo de registro y autenticación JWT.
- `npm run test-ticket`: Valida la creación y flujo básico de tickets.
- `npm run test-violations`: Verifica que se respeten las restricciones de la máquina de estados y privacidad (ej: un cliente no puede ver tickets ajenos ni saltarse estados).

## Auditoría
Gracias a los `Subscribers` de TypeORM, cada cambio significativo en un ticket (estado, prioridad, asignación) genera automáticamente una entrada en la tabla `TicketHistory`, registrando qué usuario realizó el cambio y en qué fecha.

## Deuda Técnica Conocida

- **Patrón Repository:** Actualmente los servicios dependen directamente de `AppDataSource.getRepository()` de TypeORM → La solución planeada es crear interfaces `IRepository` que abstraigan el ORM, desacoplando la lógica de negocio de la persistencia.

