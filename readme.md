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
### responsabilidades
#### **CLIENT**
*   **Registro/Login:** Puede registrarse de forma pública en la plataforma.
*   **Creación:** Puede abrir nuevos tickets detallando el problema.
*   **Visualización:** Solo tiene acceso a los tickets que él mismo creó .
*   **Acción:** Puede agregar comentarios a sus tickets y reabrirlos si considera que la solución no fue satisfactoria (siguiendo el flujo `CLOSED` -> `REOPENED`).
#### **AGENT**
*   **Login:** Acceso mediante credenciales (creadas por un Admin).
*   **Visualización:** Puede ver todos los tickets pendientes o solo los que tiene asignados.
*   **Gestión de Ciclo de Vida:** Es el encargado de mover el ticket de `OPEN` a `IN_PROGRESS` y finalmente a `CLOSED`.
*   **Comunicación:** Puede responder a cualquier ticket bajo su cargo para solicitar más información al cliente.
#### **ADMIN**
*   **Gestión de Usuarios:** Es el único con poder para crear cuentas de tipo `AGENT` y manipular usuarios.
*   **Asignación:** Puede asignar manualmente un ticket a un agente específico.
*   **Control Total:** Puede cambiar la prioridad de cualquier ticket, editar metadatos o eliminar registros.
## alcance
Diseñé el sistema para una sola organización o herramienta interna
para asegurar la calidad y robuztes del proyecto,
pero la arquitectura está preparada para escalar
añadiendo una entidad Organization y un discriminador en las consultas
## Estados de los tickets
Abierto
en proceso
cerrado
reabierto

