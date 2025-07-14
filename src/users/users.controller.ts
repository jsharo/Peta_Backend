import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, ForbiddenException, } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'; // Cambiar ruta
import { RolesGuard } from '../common/guards/roles.guard'; // Cambiar ruta
import { UsersService } from './users.service';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

  // ✅ NUEVO: Crear usuario (solo admin)
  @Post()
  @Roles(UserRole.ADMIN)
  async create(
    @Body() createUserDto: CreateUserDto,
    @GetUser() adminUser: User
  ) {
    const newUser = await this.usersService.create(createUserDto);
    return {
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    };
  }

  // ✅ NUEVO: Actualizar usuario completo (solo admin o el mismo usuario)
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.CLIENTE)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() currentUser: User
  ) {
    const targetUserId = +id;
    
    // Si no es admin, solo puede actualizar su propio perfil
    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== targetUserId) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este usuario'
      );
    }

    // Si es cliente, no puede cambiar su rol
    if (currentUser.role === UserRole.CLIENTE && updateUserDto.role) {
      throw new ForbiddenException(
        'No puedes cambiar tu propio rol'
      );
    }

    const updatedUser = await this.usersService.update(targetUserId, updateUserDto);
    return {
      message: 'Usuario actualizado exitosamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
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

    const updatedUser = await this.usersService.updateUserRole(+id, newRole);
    return {
      message: 'Rol actualizado exitosamente',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    };
  }

  // ✅ NUEVO: Eliminar usuario (solo admin)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
    @Param('id') id: string,
    @GetUser() adminUser: User
  ) {
    const targetUserId = +id;
    
    // Evitar que el admin se elimine a sí mismo
    if (adminUser.id === targetUserId) {
      throw new ForbiddenException(
        'No puedes eliminar tu propia cuenta'
      );
    }

    await this.usersService.remove(targetUserId);
    return {
      message: 'Usuario eliminado exitosamente'
    };
  }

  // ✅ NUEVO: Desactivar/activar usuario (alternativa a eliminar)
  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  async toggleUserStatus(
    @Param('id') id: string,
    @GetUser() adminUser: User
  ) {
    const targetUserId = +id;
    
    // Evitar que el admin se desactive a sí mismo
    if (adminUser.id === targetUserId) {
      throw new ForbiddenException(
        'No puedes desactivar tu propia cuenta'
      );
    }

    const user = await this.usersService.findOne(targetUserId);
    const updatedUser = await this.usersService.update(targetUserId, {
      isActive: !user.isActive
    });

    return {
      message: `Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive
      }
    };
  }
}