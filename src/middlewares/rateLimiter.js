import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 500, // 500 requests por IP cada 5 minutos
  message: { error: 'TOO_MANY_REQUESTS' }
});


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos 
  max: 20, // 20 intentos
  message: {
    success: false,
    error: 'AUTH_THROTTLED',
    message: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.'
  }
});