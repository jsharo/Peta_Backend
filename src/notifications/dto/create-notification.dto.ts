import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  petName: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  doorId?: string;
}