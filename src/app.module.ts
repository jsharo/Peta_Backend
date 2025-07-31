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
      url: process.env.DATABASE_URL || 'postgresql://petadb_user:Lt7yvYBag4TKwD1D2H6jYVGlr4BW2REd@dpg-d24mh99r0fns73d8gs90-a.oregon-postgres.render.com/petadb',
      host: process.env.DB_HOST || 'dpg-d24mh99r0fns73d8gs90-a.oregon-postgres.render.com',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'petadb_user',
      password: process.env.DB_PASSWORD || 'Lt7yvYBag4TKwD1D2H6jYVGlr4BW2REd',
      database: process.env.DB_DATABASE || 'petadb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // IMPORTANTE: Nunca true en producción
      ssl: true, // Requerido para Render PostgreSQL
      extra: {
        ssl: {
          rejectUnauthorized: false, // Necesario para conexión SSL
        },
      },
      // Configuración optimizada para producción
      logging: ['error', 'warn', 'migration'],
      poolSize: 5, // Reducido para el plan gratuito
      connectTimeoutMS: 5000, // Aumentado para conexiones remotas
      retryAttempts: 3, // Intentos de reconexión
      retryDelay: 3000, // Intervalo entre intentos
      migrationsRun: true, // Ejecuta migraciones automáticamente
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