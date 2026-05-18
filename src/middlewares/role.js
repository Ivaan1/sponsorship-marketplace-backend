import { handleHttpError } from "../utils/handleErrors.js";

const checkRole = (roles) => (req, res, next) => {
    try {
        const { user } = req;

        if (!user) {
            return handleHttpError(res, "SESSION_NOT_FOUND", 401);
        }

        const userRole = user.role;

        // Verificamos si el rol del usuario está incluido en el array de roles permitidos
        if (!roles.includes(userRole)) {
            return handleHttpError(res, "FORBIDDEN_PERMISSIONS", 403);
        }

        next();
    } catch (e) {
        handleHttpError(res, "ERROR_CHECK_ROLE", 403);
    }
};

export default checkRole;