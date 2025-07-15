// Importa los decoradores de validación y el decorador personalizado para contraseñas
import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { PasswordMatch } from '../../common/decorators/password-match.decorator';
import { UserRole } from '../../users/entities/user.entity'; 

/**
 * DTO para crear un nuevo usuario (registro).
 * Incluye validaciones para nombre, email, contraseña y confirmación de contraseña.
 */
export class CreateAuthDto {
  /**
   * Nombre del usuario (obligatorio).
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * Email del usuario (obligatorio).
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Contraseña del usuario (obligatorio, mínimo 8 caracteres).
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  /**
   * Confirmación de la contraseña (debe coincidir con password).
   */
  @IsString()
  @IsNotEmpty()
  @PasswordMatch('password')
  confirmPassword: string;

  /**
   * Rol del usuario (opcional, por defecto será CLIENTE).
   */
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser admin o cliente' })
  role?: UserRole;
}