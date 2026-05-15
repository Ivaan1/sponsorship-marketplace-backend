import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })
const JWT_SECRET = process.env.SECRET_JWT

function tokenSign(user){
    const sign = jwt.sign(
        {
            _id: user._id,
            role: user.role,
            name: user.name,
            profilePicture: user.profilePicture
        },
        JWT_SECRET,
        {
            expiresIn: "7d" 
        }
    )
    return sign
}

/**
 * Función de verificación de JWT.
 * TODO: En la futura siguiente iteración, unificar con la lógica de recovery 
 * y manejar excepciones globales para evitar retornos nulos.
 */
function verifyToken(tokenJwt){
    try {
        return jwt.verify(tokenJwt, JWT_SECRET)
    } catch(error) {
        throw new Error("INVALID_OR_EXPIRED_TOKEN")
    }
}

// =============================================================================
// FUTURAS IMPLEMENTACIONES (BACKLOG)
// Los siguientes métodos se unificarán en el servicio de autenticación global
// una vez se implemente el flujo de recuperación de contraseña/OAuth.
// =============================================================================

function tokenSignRecovery(user){
    return jwt.sign(
        {
            _id: user._id,
            purpose: "password_reset"
        },
        JWT_SECRET,
        {
            expiresIn: "15m" // corto para seguridad
        }
    );
}

function verifyRecoveryToken(tokenJwt){
    try {
        const payload = jwt.verify(tokenJwt, JWT_SECRET);
        if(payload.purpose !== "password_reset") throw new Error("Token inválido para recuperación");
        return payload;
    } catch(e){
        console.error('Error en verifyRecoveryToken:', e);
        return null;
    }
}

export { tokenSign, verifyToken, tokenSignRecovery, verifyRecoveryToken }