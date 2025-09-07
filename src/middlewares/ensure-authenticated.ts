import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { authConfig } from "@/configs/auth";
import { AppError } from "@/utils/AppError";

interface TokenPayload {
    role: string;
    sub: string; // ID do usuário como string
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
            id: Number(user_id), // 👈 conversão segura para número
            role,
        };

        return next();
    } catch (error) {
        throw new AppError("JWT Token inválido", 401);
    }
}

export { ensureAuthenticated };