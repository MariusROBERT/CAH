import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json } from 'express';
import { frontURL } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({limit: '50mb'}));
  app.enableCors({
    origin: [frontURL],
    methods: 'GET,POST',
    credentials: false,
  });

  await app.listen(3001);
}
bootstrap();
