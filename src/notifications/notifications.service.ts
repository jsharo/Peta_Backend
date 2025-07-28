import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create(createNotificationDto);
    return await this.notificationRepository.save(notification);
  }

  async createWithPetId(createNotificationDto: CreateNotificationDto, petId: number): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      petId,
    });
    return await this.notificationRepository.save(notification);
  }

  async findAll(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new NotFoundException('Notificación no encontrada'); // ✅ Usar NotFoundException
    }
    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    await this.notificationRepository.update(id, updateNotificationDto);
    return this.findOne(id);
  }

  async markAllAsRead(): Promise<void> {
    // Elimina todas las notificaciones
    await this.notificationRepository.clear();
  }

  async markAllAsReadByPetIds(petIds: number[]) {
    // Elimina todas las notificaciones de los pets del usuario
    return await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('petId IN (:...petIds)', { petIds })
      .execute();
  }

  async getUnreadCount(): Promise<number> {
    return await this.notificationRepository.count({ where: { isRead: false } });
  }

  async findByUserId(userId: number) {
    return this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.pet', 'pet')
      .where('pet.id_user = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .getMany();
  }

  async deleteAllByUserId(userId: number) {
    // Busca los pets del usuario
    const pets = await this.notificationRepository.manager.getRepository('pet').find({ where: { id_user: userId } });
    const petIds = pets.map((p: any) => p.id_pet);
    if (petIds.length === 0) return { deleted: 0 };

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('petId IN (:...petIds)', { petIds })
      .execute();

    return { deleted: result.affected };
  }
}