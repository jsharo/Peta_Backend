// Importa los decoradores de validación de class-validator
import { IsBoolean, IsNotEmpty } from 'class-validator';

/**
 * DTO para controlar el estado de la puerta (abrir/cerrar).
 * El campo lock indica si la puerta debe estar bloqueada o desbloqueada.
 */
export class ControlDoorDto {
  /**
   * Indica si la puerta debe estar bloqueada (true) o desbloqueada (false).
   */
  @IsBoolean()
  @IsNotEmpty()
  lock: boolean;
}