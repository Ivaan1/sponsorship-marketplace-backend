import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por IP
  standardHeaders: true, // Devuelve info en los headers 'RateLimit-*'
  legacyHeaders: false, // Desactiva los headers antiguos 'X-RateLimit-*'
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Has realizado demasiadas peticiones. Inténtalo de nuevo en 15 minutos.'
  }
});

// Un limitador más estricto para el Login y Registro (Evita fuerza bruta)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos 
  max: 20, // 20 intentos
  message: {
    success: false,
    error: 'AUTH_THROTTLED',
    message: 'Demasiados intentos. Inténtalo de nuevo en 15 minutos.'
  }
});