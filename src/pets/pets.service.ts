import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './entities/pet.entity';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private petsRepository: Repository<Pet>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createForClient(
  createPetDto: CreatePetDto, 
  clientId: number, 
  file?: Express.Multer.File
): Promise<Pet> {
  // Verificar que el cliente existe
  const client = await this.usersRepository.findOne({
    where: { id_user: clientId }
  });
  
  if (!client) {
    throw new NotFoundException('Cliente no encontrado');
  }

  const pet = this.petsRepository.create({
    name_pet: createPetDto.name_pet,
    species: createPetDto.species,
    race: createPetDto.race,
    sex: createPetDto.sex,
    id_collar: createPetDto.id_collar,
    id_user: clientId,
    photo: file ? file.filename : undefined, // Mantener undefined para compatibilidad de tipos
  });
  
  return await this.petsRepository.save(pet);
}

  async create(createPetDto: CreatePetDto, owner: User, file?: Express.Multer.File): Promise<Pet> {
  console.log('🔧 PetsService.create - Datos recibidos:', {
    dto: createPetDto,
    owner: owner.id_user,
    file: file ? file.filename : 'sin archivo'
  });

  const pet = this.petsRepository.create({
    name_pet: createPetDto.name_pet,
    species: createPetDto.species || '',
    race: createPetDto.race || '',
    sex: createPetDto.sex || '',
    id_collar: createPetDto.id_collar,
    id_user: owner.id_user,
    photo: file ? file.filename : undefined
  });
  
  console.log('🐕 Pet entity creado:', pet);
  
  try {
    const savedPet = await this.petsRepository.save(pet);
    console.log('✅ Pet guardado exitosamente:', savedPet);
    return savedPet;
  } catch (error) {
    console.error('❌ Error al guardar pet:', error);
    throw error;
  }
}

  async findAllByOwner(ownerId: number): Promise<Pet[]> {
    return await this.petsRepository.find({
      where: { id_user: ownerId },
    });
  }

  async findOne(id: number, ownerId: number): Promise<Pet> {
    const pet = await this.petsRepository.findOne({
      where: { id_pet: id, id_user: ownerId },
    });
    if (!pet) {
      throw new NotFoundException('Mascota no encontrada');
    }
    return pet;
  }

  async update(id: number, updatePetDto: UpdatePetDto, ownerId: number): Promise<Pet> {
    const pet = await this.findOne(id, ownerId);
    Object.assign(pet, updatePetDto);
    return await this.petsRepository.save(pet);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const result = await this.petsRepository.delete({ id_pet: id, id_user: ownerId });
    if (result.affected === 0) {
      throw new NotFoundException('Mascota no encontrada');
    }
  }
}