export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'fallback-secret-for-dev',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h'
};