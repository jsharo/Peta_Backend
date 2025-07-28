import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PetsService } from '../pets/pets.service';


@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly petsService: PetsService  // Añade esta inyección
  ) {}
  
  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  @Get('unread/count')
  getUnreadCount() {
    return this.notificationsService.getUnreadCount();
  }

  @Patch(':id/read')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Post('mark-all-read')
  markAllAsRead() {
    return this.notificationsService.markAllAsRead();
  }

  //Endpoint para recibir notificaciones desde el dispositivo
  @Post('device')
  async createFromDevice(@Body() createNotificationDto: CreateNotificationDto) {
    try {
      // Buscar la mascota asociada al collar con ese UID
      const pet = await this.petsService.findByCollarId(createNotificationDto.petName);

      if (pet) {
        createNotificationDto.petName = pet.name_pet;
        // Crear la notificación con el nombre real y el petId
        return this.notificationsService.createWithPetId(createNotificationDto, pet.id_pet);
      }
      // Si no hay mascota, crea la notificación normal (sin petId)
      return this.notificationsService.create(createNotificationDto);
    } catch (error) {
      console.error('Error al procesar notificación de dispositivo:', error);
      return this.notificationsService.create(createNotificationDto);
    }
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.notificationsService.findByUserId(Number(userId));
  }

  @Delete('user/:userId')
  async deleteAllByUser(@Param('userId') userId: string) {
    return this.notificationsService.deleteAllByUserId(Number(userId));
  }

  @Patch('user/:userId/read-all')
  async markAllAsReadByUser(@Param('userId') userId: string) {
    // Busca los pets del usuario y marca todas sus notificaciones como leídas
    const pets = await this.petsService.findByUserId(Number(userId));
    const petIds = pets.map((p: any) => p.id_pet);
    if (petIds.length === 0) return { updated: 0 };

    const result = await this.notificationsService.markAllAsReadByPetIds(petIds);
    return { updated: result.affected };
  }
}