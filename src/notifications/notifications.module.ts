import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './entities/notification.entity';
import { PetsModule } from '../pets/pets.module';  // Añade esta importación

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    PetsModule,  // Importa el módulo de mascotas
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}