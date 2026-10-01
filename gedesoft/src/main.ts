import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- CONFIGURACIÃ“N DE CORS SEGURA ---
  // Leer orÃ­genes permitidos desde variables de entorno, por defecto localhost
  const allowedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',') 
    : ['http://localhost:4000', 'http://127.0.0.1:4000'];

  const corsOptions = {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  };
  
  // Aplica la configuraciÃ³n de CORS a tu aplicaciÃ³n
  app.enableCors(corsOptions);
  app.setGlobalPrefix('api');
  // --- FIN DE CORS ---

  // ConfiguraciÃ³n Swagger
  const config = new DocumentBuilder()
    .setTitle('API del Proyecto')
    .setDescription('DocumentaciÃ³n de la API con Swagger')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Tu API Doc estarÃ¡ en /api

  // Inicia la aplicaciÃ³n
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
