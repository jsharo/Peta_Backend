import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from './constants';
import { RolesGuard } from 'src/common/guards/roles.guard'; // Importamos el guard de roles

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Para acceder al repositorio de User
    JwtModule.register({ // Configuración del módulo JWT
      secret: jwtConstants.secret,
      signOptions: { 
        expiresIn: jwtConstants.expiresIn,
        // Puedes ajustar el tiempo de expiración según tus necesidades
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy,
    RolesGuard, // Añadimos el guard de roles como proveedor
    // Opcional: Si quieres hacer el RolesGuard global
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    }
  ],
  exports: [
    AuthService,
    JwtModule, // Exportamos JwtModule para usarlo en otros módulos
    RolesGuard, // Opcional: si necesitas usarlo en otros módulos
  ],
})
export class AuthModule {}