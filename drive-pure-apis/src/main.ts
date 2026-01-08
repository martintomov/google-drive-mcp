import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('Google Drive Pure APIs')
    .setDescription(
      'REST API for Google Drive, Docs, Sheets, and Slides operations. ' +
      'Converted from MCP server to pure HTTP endpoints with API key authentication.',
    )
    .setVersion('1.0.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API Key for authentication',
      },
      'api-key',
    )
    .addTag('Health', 'Health check endpoints')
    .addTag('Files', 'File management operations')
    .addTag('Docs', 'Google Docs operations')
    .addTag('Sheets', 'Google Sheets operations')
    .addTag('Slides', 'Google Slides operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Drive APIs - Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Drive Pure APIs Server Started`);
  console.log(`📖 API Documentation: http://localhost:${port}/api-docs`);
  console.log(`❤️  Health Check: http://localhost:${port}/health`);
  console.log(`🔑 Authentication: API Key required (X-API-Key header)\n`);
}

bootstrap();
