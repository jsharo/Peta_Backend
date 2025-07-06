// Importa los decoradores de validación y el decorador personalizado para contraseñas
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { PasswordMatch } from '../decorators/password-match.decorator';

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
}