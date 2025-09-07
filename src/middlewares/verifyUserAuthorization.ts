import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";
import { request } from "http";

function verifyUserAuthorization(role: string[]) {
    return (request: Request, response: Response, next: NextFunction) => {
        if (!request.user) {
            throw new AppError("Não Autorizado", 401)
        }
        if (!role.includes(request.user.role)) {
            throw new AppError("Não Autorizado", 401)
        }
        return next()
    }
}

export { verifyUserAuthorization }