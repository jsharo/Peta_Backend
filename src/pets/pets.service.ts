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
  ) {}

  async create(createPetDto: CreatePetDto, owner: User): Promise<Pet> {
    const pet = this.petsRepository.create({
      ...createPetDto,
      id_user: owner.id_user,
    });
    return await this.petsRepository.save(pet);
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
      throw new NotFoundException('Mascota no encontrada'); // ✅ Usar NotFoundException
    }
    return pet;
  }

  async update(id: number, updatePetDto: UpdatePetDto, ownerId: number): Promise<Pet> {
    const pet = await this.findOne(id, ownerId); // ✅ Reutilizar método que ya valida
    Object.assign(pet, updatePetDto);
    return await this.petsRepository.save(pet);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    await this.petsRepository.delete({ id_pet: id, id_user: ownerId });
  }
}