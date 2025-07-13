import { Controller, Get, UseGuards, Req, ForbiddenException, Param, Patch, Body } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwt-auth.guard';
import { UsersService } from './users.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // Protección JWT + Roles
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@GetUser() user: User) {
    // Endpoint accesible por cualquier usuario autenticado
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  @Get()
  @Roles(UserRole.ADMIN) // Solo accesible por administradores
  async findAllUsers(@GetUser() requestingUser: User) {
    // Aseguramos que el servicio retorna un array de usuarios
    const users = await this.usersService.findAll();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }));
  }

  @Get('all-profiles')
  @Roles(UserRole.ADMIN) // Solo admin puede ver todos los perfiles
  async getAllProfiles() {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    }));
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CLIENTE) // Accesible por ambos roles
  async findOne(
    @Req() req,
    @GetUser() currentUser: User,
    @Param('id') id: string
  ) {
    const user = await this.usersService.findOne(+id);
    if (!user) {
      throw new ForbiddenException('Usuario no encontrado');
    }
    // Si no es admin, solo puede ver su propio perfil
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== user.id) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este recurso'
      );
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  }

  // Ejemplo de endpoint para que un admin actualice roles
  @Patch(':id/role')
  @Roles(UserRole.ADMIN) // Estrictamente solo admin
  async updateUserRole(
    @Param('id') id: string,
    @Body('newRole') newRole: UserRole,
    @GetUser() adminUser: User
  ) {
    // Verificación adicional por si acaso
    if (adminUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Requieres privilegios de administrador'
      );
    }

    return this.usersService.updateUserRole(+id, newRole);
  }
}