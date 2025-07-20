import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  name_pet: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsString()
  @IsOptional()
  race?: string;

  @IsString()
  @IsOptional()
  sex?: string;

  @IsString()
  @IsNotEmpty()
  id_collar: string;
}