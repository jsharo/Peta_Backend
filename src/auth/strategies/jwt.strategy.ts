import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';
import { UserRole } from 'src/users/entities/user.entity'; // Importamos el enum de roles

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    
    });
  }

  /**
   * Método de validación del payload JWT
   * @param payload - El contenido decodificado del JWT
   * @returns Objeto usuario que se adjuntará a req.user
   */
  async validate(payload: any) {
    // El payload debe contener al menos:
    // sub (subject/userId), email y role
    return { 
      userId: payload.sub, 
      email: payload.email,
      role: payload.role || UserRole.USER // Valor por defecto si no viene en el token
    };
  }
}