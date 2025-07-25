import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // ✅ Mejora: Validar que el usuario existe
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado en la request');
    }

    // ✅ Mejora: Validar que el usuario tiene un rol definido
    // ✅ Mejora: Validar que el usuario tiene un rol definido
    if (!user.rol) {
      throw new ForbiddenException('Usuario sin rol asignado');
    }

    if (!requiredRoles.includes(user.rol)) {
      throw new ForbiddenException('No tienes permisos para acceder a este recurso');
    }

    return true;
  }
}