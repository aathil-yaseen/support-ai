import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ================================
  // CORS
  // ================================
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ],
  });

  // ================================
  // GLOBAL VALIDATION
  // ================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // ================================
  // SWAGGER
  // ================================
  const config = new DocumentBuilder()
    .setTitle('SupportAI API')
    .setDescription(
      'AI-powered customer support API',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document =
    SwaggerModule.createDocument(
      app,
      config,
    );

  SwaggerModule.setup(
    'api',
    app,
    document,
  );

  // ================================
  // SERVER
  // ================================
  await app.listen(4000);
}

bootstrap();