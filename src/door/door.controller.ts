import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DoorService } from './door.service';
import { ControlDoorDto } from './dto/control-door.dto';

@Controller('door')
export class DoorController {
  constructor(private readonly doorService: DoorService) {}

  @Post(':id/control')
  async controlDoor(
    @Param('id') id: string,
    @Body() controlDoorDto: ControlDoorDto,
  ) {
    return this.doorService.controlDoor(id, controlDoorDto);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    return this.doorService.getDoorStatus(id);
  }
}