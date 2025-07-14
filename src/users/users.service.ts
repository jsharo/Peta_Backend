import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

     // ✅ CORREGIR: Usar el name del DTO
  const user = this.usersRepository.create({
    name: createUserDto.name, // ✅ Usar el name del DTO
    email: createUserDto.email,
    password: hashedPassword,
    role: createUserDto.role || UserRole.CLIENTE,
    isActive: true // ✅ Establecer explícitamente
  });

    const savedUser = await this.usersRepository.save(user);
    
    // Retornar sin password
    const { password, ...result } = savedUser;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'name', 'email', 'role', 'isActive']
    });
  }

  async findOne(id: number): Promise<User> { // ✅ Cambiar: remover | null
    const user = await this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'name', 'email', 'role', 'isActive']
    });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    return user; // ✅ Ahora garantiza que siempre retorna User
  }

  async updateUserRole(id: number, newRole: UserRole): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    user.role = newRole;
    const updatedUser = await this.usersRepository.save(user);
    
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se está actualizando el email, verificar que no exista
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email }
      });
      
      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Si se está actualizando la contraseña, hashearla
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar los campos del usuario
    Object.assign(user, updateUserDto);
    
    // Guardar y retornar sin password
    const updatedUser = await this.usersRepository.save(user);
    const { password, ...result } = updatedUser;
    return result as User;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.usersRepository.remove(user);
  }

  // Método auxiliar para encontrar usuario por email (usado en auth)
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }
}