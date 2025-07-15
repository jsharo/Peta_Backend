import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from '../common/constants';
import { RolesGuard } from '../common/guards/roles.guard'; // Importamos el guard de roles

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
  providers: [AuthService, JwtStrategy, RolesGuard], // ✅ Incluir RolesGuard en providers
  exports: [AuthService, JwtStrategy, RolesGuard], // ✅ Ahora sí se puede exportar
})
export class AuthModule {}