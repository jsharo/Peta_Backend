import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // Asegúrate de seleccionar explícitamente el password
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password') // Esto es crucial para obtener el password
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
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createAuthDto: CreateAuthDto) {
    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
    const user = this.usersRepository.create({
      name: createAuthDto.name,
      email: createAuthDto.email,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);
    const { password, ...result } = user;
    return result;
  }

  async updateUser(id: number, updateAuthDto: UpdateAuthDto) {
    // Selecciona explícitamente el password
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (updateAuthDto.password) {
      if (!updateAuthDto.currentPassword || 
          !(await bcrypt.compare(updateAuthDto.currentPassword, user.password))) {
        throw new UnauthorizedException('La contraseña actual es incorrecta');
      }
      updateAuthDto.password = await bcrypt.hash(updateAuthDto.password, 10);
    }

    await this.usersRepository.update(id, updateAuthDto);
    return this.usersRepository.findOne({ where: { id } });
  }
}