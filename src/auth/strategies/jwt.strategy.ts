import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../../common/constants';
import { UserRole } from '../../users/entities/user.entity';// Importamos el enum de roles

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
  // ...existing code...
  async validate(payload: any) {
    return { 
      id_user: payload.sub, 
      email: payload.email,
      rol: payload.rol || payload.role || UserRole.CLIENT // Acepta ambos campos
    };
  }
// ...existing code...
}