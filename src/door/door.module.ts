import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoorService } from './door.service';
import { DoorController } from './door.controller';
import { Door } from './entities/door.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Door]), HttpModule],
  controllers: [DoorController],
  providers: [DoorService],
  exports: [DoorService],
})
export class DoorModule {}