import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // ✅ AGREGAR esta propiedad específica para updates
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}