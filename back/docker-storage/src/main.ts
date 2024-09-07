import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({limit: '50mb'}));
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET',
    credentials: false, // Permettre les cookies, si nécessaire
  });

  await app.listen(3001);
}
bootstrap();
