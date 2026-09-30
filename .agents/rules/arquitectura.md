---
trigger: always_on
---

# Arquitectura de Order Digital

## Backend (Carpeta: `gedesoft/`)
- Stack: NestJS, MySQL, Prisma ORM.
- Enrutamiento: Todos los comandos de CLI, servicios y controladores del backend deben ejecutarse y guardarse DENTRO de `gedesoft/`.
- Base de datos: Utiliza Prisma ORM para gestionar la base de datos relacional de la aplicación.

## Frontend (Carpeta: `gedesoftFront/`)
- Stack: Angular, SCSS.
- Enrutamiento: Todo el código de interfaz, consumo de API y componentes del menú digital QR debe ir DENTRO de `gedesoftFront/src/app/`.
- Estructura: Utiliza Standalone Components y el sistema de reactividad con Signals.

## Infraestructura
- La orquestación de los contenedores Docker se gestiona desde el archivo `compose.yaml` en la raíz.