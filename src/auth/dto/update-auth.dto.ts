
// Importa los decoradores de validación de class-validator
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';


/**
 * DTO para actualizar los datos de autenticación del usuario.
 * Permite actualizar nombre, email y contraseña.
 */
export class UpdateAuthDto {
  /**
   * Nombre del usuario (opcional).
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * Email del usuario (opcional).
   */
  @IsOptional()
  @IsEmail()
  email?: string;

  /**
   * Nueva contraseña (opcional, mínimo 8 caracteres).
   */
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe contener al menos 8 caracteres' })
  password?: string;

  /**
   * Contraseña actual (opcional, requerida si se cambia la contraseña).
   */
  @IsOptional()
  @IsString()
  currentPassword?: string;
}