import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { loggerDI } from './middlewares/loggerDI.middleware';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? 3000;
  try {
    
    app.use(loggerDI);
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

    await app.listen(PORT)
    console.log(`Server running on port ${process.env.PORT ?? 3000}`);
    
  } catch (error) {
    console.error('Error starting the server:', error);
  }
}

bootstrap().catch((error) => {
  console.error('Fatal error in bootstrap:', error);
});
