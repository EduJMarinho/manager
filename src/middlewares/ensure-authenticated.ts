import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { authConfig } from "../configs/auth";
import { AppError } from "../utils/AppError";

interface TokenPayload {
    role: string;
    sub: string;
}

// Tipagem estendida para request.user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                role: string;
            };
        }
    }
}

function ensureAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction
) {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new AppError("JWT Token não encontrado", 401);
        }

        const [, token] = authHeader.split(" ");

        const { role, sub: user_id } = verify(token, authConfig.jwt.secret) as TokenPayload;

        request.user = {
            id: user_id, //  mantém como string para evitar conflito de tipos
            role,
        };

        return next();
    } catch (error) {
        throw new AppError("JWT Token inválido", 401);
    }
}

export { ensureAuthenticated };