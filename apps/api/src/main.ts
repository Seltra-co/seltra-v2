import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors({
  //   origin: 'http://localhost:3000',
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   credentials: true,
  // });
  app.enableCors({
  origin: true,
  credentials: true,
});

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8000;
  await app.listen(port);
}
bootstrap();