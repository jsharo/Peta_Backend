import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserRole } from '../users/entities/user.entity'; // Importamos el enum de roles

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    // Incluimos el rol en el payload del JWT
    const payload = { 
      email: user.email, 
      sub: user.id,
      role: user.role // Añadimos el rol al payload
    };
    
    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role // Incluimos el rol en la respuesta
      }
    };
  }

  async register(createAuthDto: CreateAuthDto) {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: createAuthDto.email } 
    });
    
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    
    // Crear usuario con rol por defecto (USER) si no se especifica
    const user = this.usersRepository.create({
      name: createAuthDto.name,
      email: createAuthDto.email,
      password: hashedPassword,
      role: createAuthDto.role || UserRole.CLIENTE // Permite poner el rol pero usa el rol del DTO o CLIENTE por defecto
    });

    await this.usersRepository.save(user);
    
    // No retornamos el password
    const { password, ...result } = user;
    return {
      ...result,
      message: 'Usuario registrado exitosamente'
    };
  }

  async updateUser(id: number, updateAuthDto: UpdateAuthDto) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Verificación de contraseña actual solo si se quiere cambiar la contraseña
    if (updateAuthDto.password) {
      if (!updateAuthDto.currentPassword || 
          !(await bcrypt.compare(updateAuthDto.currentPassword, user.password))) {
        throw new UnauthorizedException('La contraseña actual es incorrecta');
      }
      updateAuthDto.password = await bcrypt.hash(updateAuthDto.password, 10);
    }

    // Actualizar solo los campos permitidos
    const { currentPassword, ...validUpdateData } = updateAuthDto;
    await this.usersRepository.update(id, validUpdateData);
    
    return this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'name', 'email', 'role', 'isActive'] 
    });
  }

  // Método adicional para actualizar roles (solo accesible por admin)
  async updateUserRole(id: number, newRole: UserRole, requestingUser: User) {
    // Verificar que el usuario que hace la petición es admin
    if (requestingUser.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('No tienes permisos para esta acción');
    }

    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    user.role = newRole;
    await this.usersRepository.save(user);
    
    const { password, ...result } = user;
    return result;
  }
}