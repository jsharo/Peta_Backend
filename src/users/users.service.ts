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
    name: createUserDto.name,
    email: createUserDto.email,
    password: hashedPassword,
    rol: createUserDto.role || UserRole.CLIENT,
    is_active: true
  });

    const savedUser = await this.usersRepository.save(user);
    
    // Retornar sin password
    const { password, ...result } = savedUser;
    return result as User;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id_user', 'name', 'email', 'rol', 'is_active']
    });
  }

  async findAllClients(): Promise<User[]> {
    return this.usersRepository.find({
      where: { rol: UserRole.CLIENT },
      select: ['id_user', 'name', 'email', 'rol', 'is_active']
    });
  }

  async findOne(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { id_user: Number(id) },
      select: ['id_user', 'name', 'email', 'rol', 'is_active']
    });
  }

  async updateUserRole(id: number, newRole: UserRole): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id_user: id } });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    user.rol = newRole;
    await this.usersRepository.save(user);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id_user: id } });
    
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

  async updateStatus(id: string, isActive: boolean) {
    const user = await this.usersRepository.findOne({ where: { id_user: Number(id) } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.is_active = isActive;
    await this.usersRepository.save(user);
    return { is_active: user.is_active };
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id_user: id } });
    
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