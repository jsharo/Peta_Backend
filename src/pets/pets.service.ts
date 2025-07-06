import { Injectable } from '@nestjs/common';
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
      owner,
    });
    return await this.petsRepository.save(pet);
  }

  async findAllByOwner(ownerId: number): Promise<Pet[]> {
    return await this.petsRepository.find({
      where: { owner: { id: ownerId } },
    });
  }

  async findOne(id: number, ownerId: number): Promise<Pet> {
    const pet = await this.petsRepository.findOne({
      where: { id, owner: { id: ownerId } },
    });
    if (!pet) {
      throw new Error('Mascota no encontrada');
    }
    return pet;
  }

  async update(id: number, updatePetDto: UpdatePetDto, ownerId: number): Promise<Pet> {
    await this.petsRepository.update(
      { id, owner: { id: ownerId } },
      updatePetDto,
    );
    const pet = await this.findOne(id, ownerId);
    if (!pet) {
      throw new Error('Mascota no encontrada');
    }
    return pet;
  }

  async remove(id: number, ownerId: number): Promise<void> {
    await this.petsRepository.delete({ id, owner: { id: ownerId } });
  }
}