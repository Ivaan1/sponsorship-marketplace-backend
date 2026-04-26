import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config({ quiet: true })
const JWT_SECRET = process.env.SECRET_JWT

function tokenSign(user){
    const sign = jwt.sign(
        {
            _id: user._id,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "120d" //cambiar a 7
        }
    )
    return sign
}

function verifyToken(tokenJwt){
    try {
        return jwt.verify(tokenJwt, JWT_SECRET)
    } catch(e) {
        console.error('Error en verifyToken:', e)
    }
}


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