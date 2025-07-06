
// Importa los decoradores y tipos necesarios de class-validator
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Decorador personalizado para validar que dos propiedades de un DTO coincidan (por ejemplo, password y confirmPassword).
 * @param property - El nombre de la propiedad con la que debe coincidir.
 * @param validationOptions - Opciones adicionales de validación.
 */
export function PasswordMatch(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'PasswordMatch', // Nombre del decorador
      target: object.constructor, // Clase objetivo
      propertyName: propertyName, // Propiedad a validar
      constraints: [property], // Propiedad con la que debe coincidir
      options: validationOptions, // Opciones de validación
      validator: {
        /**
         * Lógica de validación: compara el valor de la propiedad actual con la propiedad relacionada.
         */
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value === relatedValue;
        },
        /**
         * Mensaje de error por defecto si la validación falla.
         */
        defaultMessage(args: ValidationArguments) {
          return 'Las contraseñas no coinciden';
        },
      },
    });
  };
}


/**
 * Clase de constraint para validación avanzada (no usada directamente aquí, pero útil para extender validaciones).
 */
export class PasswordMatchConstraint {
  /**
   * Lógica de validación: compara el valor de la propiedad actual con la propiedad relacionada.
   */
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return value === relatedValue;
  }

  /**
   * Mensaje de error por defecto si la validación falla.
   */
  defaultMessage(args: ValidationArguments) {
    return 'Las contraseñas no coinciden';
  }
}