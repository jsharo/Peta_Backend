export const jwtConstants = {
  secret: process.env.JWT_SECRET || '741951', // Usa variables de entorno en producción
  expiresIn: '1h'
};