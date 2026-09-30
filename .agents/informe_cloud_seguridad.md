# Informe de Arquitectura y Seguridad: Order Digital

## 1. 🛡️ Auditoría de Seguridad (Security Auditor)

He revisado la arquitectura actual de \order Digital\ (basada en NestJS, Angular y MySQL Dockerizados) y he detectado varios riesgos críticos que debemos mitigar antes de llevar el sistema a producción:

### Hallazgos Críticos (Nivel Alto)
- **Credenciales en texto plano:** El archivo \compose.yaml\ expone contraseñas estáticas de la base de datos (\MYSQL_ROOT_PASSWORD\, \MYSQL_PASSWORD\).
- **Secretos JWT Inseguros:** En el entorno local se está pasando un \JWT_SECRET\ débil (\supersecretjwt\).
- **Falta de cifrado en tránsito:** Actualmente la aplicación funciona por HTTP (puertos 3000 y 4000). Se requiere implementar TLS/HTTPS.
- **Configuración CORS permisiva:** En \main.ts\ y \pedidos.gateway.ts\, el CORS está configurado con \origin: true\, lo que permite que **cualquier dominio** interactúe con la API.

### Recomendaciones (DevSecOps)
- Implementar un gestor de secretos (ej. AWS Secrets Manager o Doppler) en lugar de usar variables de entorno quemadas en el \compose.yaml\.
- Restringir el CORS únicamente a los dominios autorizados (ej. \https://app.orderdigital.com\).
- Habilitar validaciones estrictas y Rate Limiting en el backend NestJS para prevenir ataques de fuerza bruta en los endpoints de \/auth/login\.

---

## 2. ☁️ Arquitectura Cloud Propuesta (Cloud Architect)

Para que el sistema sea escalable, resiliente y seguro en un entorno de producción real, propongo la siguiente arquitectura (Ejemplo en AWS):

### A. Frontend (Angular)
- **Hospedaje:** AWS S3 (Static Website Hosting) para servir los archivos estáticos de forma económica.
- **Distribución (CDN):** AWS CloudFront en frente de S3 para caché global, baja latencia y terminación de certificados SSL/TLS (HTTPS) gratuitos con AWS Certificate Manager.

### B. Backend (NestJS & WebSockets)
- **Cómputo:** AWS Fargate (Serverless Containers) a través de ECS. Esto elimina la necesidad de gestionar servidores y escala los contenedores automáticamente según la carga.
- **Balanceador de Carga:** Application Load Balancer (ALB) manejando el tráfico HTTPS y soportando la persistencia de las conexiones WebSockets necesarias para la sincronización de mesas y cocina.

### C. Base de Datos (MySQL)
- **Almacenamiento:** Amazon RDS para MySQL (Managed Database). 
- **Ventajas:** Backups automáticos, cifrado en reposo (KMS), Multi-AZ (para alta disponibilidad si falla una zona) y parcheo automático.

---

## 3. 🧩 Orquestación Full-Stack (Plan de Acción)

Para implementar estos cambios y corregir el rumbo del proyecto, propongo el siguiente flujo de trabajo Full-Stack:

### Fase 1: Corrección de Código y Seguridad (Local)
1. **Backend:** Refactorizar main.ts para leer orígenes CORS desde variables de entorno, y agregar un módulo de Rate Limiting.
2. **Infraestructura Local:** Crear un archivo .env que esté en el .gitignore para no subir contraseñas a GitHub, e inyectarlo en el compose.yaml.
3. **Frontend:** Asegurar que los tokens JWT se envían y destruyen correctamente al cerrar sesión, y verificar que no hay datos sensibles quemados.

### Fase 2: Infraestructura como Código (IaC)
1. Desarrollar scripts de Terraform o AWS CDK para provisionar el RDS, Fargate, S3 y CloudFront mencionados en la arquitectura.
2. Diseñar la red virtual (VPC) para que la base de datos sea **privada** (sin acceso directo desde internet), permitiendo acceso solo desde el backend en Fargate.

### Fase 3: Integración y Despliegue Continuo (CI/CD)
1. Crear un flujo de GitHub Actions que:
   - Construya las imágenes Docker del backend y las suba a ECR (Elastic Container Registry).
   - Compile la app de Angular (\
g build\) y sincronice los archivos con S3.
   - Invalide la caché de CloudFront para que los usuarios vean la última versión.
