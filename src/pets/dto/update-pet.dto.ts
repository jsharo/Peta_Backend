import { PartialType } from '@nestjs/mapped-types';
import { CreatePetDto } from './create-pet.dto';

export class UpdatePetDto extends PartialType(CreatePetDto) {
  name_pet?: string;
  species?: string;
  race?: string;
  sex?: string;
  id_collar?: string;
  age_pet?: number;
  photo?: string; // <-- agrega si quieres actualizar foto por nombre de archivo
}