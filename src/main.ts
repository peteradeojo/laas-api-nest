import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { corsOptions } from './util/config';
import helmet from 'helmet';

const morgan = require('morgan');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(helmet());
  app.enableCors(corsOptions());

  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
    }),
  );

  // Swaggwer Setup
  const config = new DocumentBuilder()
    .setTitle('LAAS API')
    .setDescription('Logging API for the LAAS project')
    .setVersion('1.0')
    .addTag('logs')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}
bootstrap();
