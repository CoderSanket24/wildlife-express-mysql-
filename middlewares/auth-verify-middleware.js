import { verifyToken } from "../services/auth.service.js";

export const verifyAuthentication = (req,res,next) => {
    const token = req.cookies.session_token;
    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decodedToken = verifyToken(token);
        req.user = decodedToken;
        console.log(req.user);
    } catch (error) {
        req.user = null;
    }

    return next();
}