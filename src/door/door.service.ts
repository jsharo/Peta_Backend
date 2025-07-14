import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Door } from './entities/door.entity';
import { ControlDoorDto } from './dto/control-door.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DoorService {
  private readonly logger = new Logger(DoorService.name);

  constructor(
    @InjectRepository(Door)
    private readonly doorRepository: Repository<Door>,
    private readonly httpService: HttpService,
  ) {}

  async controlDoor(doorId: string, controlDoorDto: ControlDoorDto): Promise<Door> {
    const door = await this.doorRepository.findOne({ where: { id: doorId } });
    
    if (!door) {
      throw new NotFoundException('Puerta no encontrada'); // ✅ Usar NotFoundException
    }

    // Actualizar estado en base de datos
    door.isLocked = controlDoorDto.lock;
    door.lastStatusChange = new Date();
    await this.doorRepository.save(door);

    // Enviar comando al ESP32
    try {
      const esp32Url = `http://${door.esp32Id}/api/door`; // Ajusta según tu configuración
      const response = await firstValueFrom(
        this.httpService.post(esp32Url, { lock: controlDoorDto.lock }),
      );
      
      this.logger.log(`ESP32 response: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logger.error('Error communicating with ESP32', error.stack);
      // Puedes decidir revertir el cambio o manejar el error de otra manera
    }

    return door;
  }

  async getDoorStatus(doorId: string): Promise<Door> {
    const door = await this.doorRepository.findOne({ where: { id: doorId } });
    if (!door) {
      throw new NotFoundException('Puerta no encontrada'); // ✅ Consistente
    }
    return door;
  }
}