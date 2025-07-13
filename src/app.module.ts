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
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '741951',
      database: 'petadb',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Solo para desarrollo
    }),
    AuthModule,
    UsersModule,
    PetsModule,
    NotificationsModule,
    DoorModule,
  ],
  providers: [], // <-- Aquí irían providers de aplicación global (si los necesitaras)
})
export class AppModule {}