import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {

  // Crear directorios necesarios para uploads
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const petsDir = path.join(uploadsDir, 'pets');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('📁 Directorio uploads creado');
  }
  
  if (!fs.existsSync(petsDir)) {
    fs.mkdirSync(petsDir);
    console.log('📁 Directorio uploads/pets creado');
  }

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'], // Activar todos los logs
  });
  
  app.enableCors({
  origin: '*',  // Permitir cualquier origen temporalmente para pruebas
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  await app.listen(process.env.PORT ?? 3000); // ✅ Usar variable de entorno
}
bootstrap();