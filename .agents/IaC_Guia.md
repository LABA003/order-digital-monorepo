# Phase 2: Infrastructure as Code (Terraform)

He creado la carpeta 	erraform/ con toda la infraestructura necesaria para desplegar order Digital en AWS. Esta infraestructura sigue las mejores prácticas propuestas por el **Cloud Architect**:

## Estructura de Archivos
- main.tf: Configuración del proveedor de AWS y backend de estado.
- 
etwork.tf: Define la VPC, subredes públicas/privadas y Security Groups.
- ds.tf: Provisiona la base de datos MySQL gestionada y cifrada en una subred privada.
- ecs.tf: Crea el clúster ECS con AWS Fargate, el repositorio ECR para las imágenes Docker y el Balanceador de Carga (ALB).
- cloudfront.tf: Configura el bucket S3 privado y la CDN de CloudFront para servir la aplicación Angular.
- ariables.tf & outputs.tf: Variables dinámicas y salidas útiles.

## Cómo Desplegar

Para llevar esto a la nube de AWS, necesitas instalar [Terraform](https://developer.hashicorp.com/terraform/downloads) y configurar tus credenciales de AWS (\ws configure\).

Luego, entra a la carpeta y ejecuta:

`ash
cd terraform
terraform init
terraform plan -var="db_username=admin" -var="db_password=UnaContrasenaSegura123!"
terraform apply -var="db_username=admin" -var="db_password=UnaContrasenaSegura123!"
`

*Nota: En un entorno de producción real, las credenciales no deben pasarse por consola, sino que se inyectan a través del CI/CD de forma encriptada o usando AWS Secrets Manager.*

## ¿Qué sigue? (Fase 3)

Una vez que la infraestructura está viva, necesitamos automatizar que el código se compile y suba a AWS cada vez que hagas un \git push\.
Si estás listo, dímelo y usaré la skill **cicd-automation-workflow-automate** para crear tu archivo .github/workflows/deploy.yml y orquestar el despliegue automático del backend y frontend.
