import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ControlDoorDto {
  @IsBoolean()
  @IsNotEmpty()
  lock: boolean;
}