import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PetsModule } from './pets/pets.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DoorModule } from './door/door.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL, // Usamos la URL completa de conexión
      host: process.env.DB_HOST || 'dpg-d24an09z0fns73d6gs60-a.oregon-postgresql.render.com',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'petadb_user',
      password: process.env.DB_PASSWORD || 'LT7yvYBag4TkwD1D2H6jYYGLr4BW2REd',
      database: process.env.DB_DATABASE || 'petadb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // IMPORTANTE: false en producción
      ssl: true, // Necesario para Render PostgreSQL
      extra: {
        ssl: {
          rejectUnauthorized: false, // Necesario para la conexión SSL
        },
      },
      // Opciones adicionales recomendadas para producción
      logging: ['error', 'warn'],
      poolSize: 10,
      connectTimeoutMS: 2000,
    }),
    AuthModule,
    UsersModule,
    PetsModule,
    NotificationsModule,
    DoorModule,
  ],
  providers: [],
})
export class AppModule {}