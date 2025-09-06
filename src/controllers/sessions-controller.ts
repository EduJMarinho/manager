import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { compare } from "bcrypt";
import { z } from "zod";
import { AppError } from "@/utils/AppError";
import { authConfig } from "@/configs/auth";
import { sign } from "jsonwebtoken";

class SessionsController {
    async create(request: Request, response: Response) {
        // Validação do corpo da requisição
        const bodySchema = z.object({
            email: z.string().email(),
            password: z.string().min(6),
        });

        const { email, password } = bodySchema.parse(request.body);

        // Busca do usuário pelo e-mail
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError("email e/ou senha inválida", 401);
        }

        // Verificação da senha
        const passwordMatched = await compare(password, user.password);

        if (!passwordMatched) {
            throw new AppError("email e/ou senha inválida", 401);
        }

        // Garante que o secret está definido
        if (!authConfig.jwt.secret) {
            throw new Error("JWT_SECRET não está definido nas variáveis de ambiente");
        }

        // Geração do token JWT
        const token = sign(
            { role: user.role ?? "collaborator" },
            authConfig.jwt.secret,
            {
                subject: String(user.id),
                expiresIn: authConfig.jwt.expiresIn,
            }
        );

        // Retorno da resposta com token e dados mínimos do usuário
        return response.json({
            user: {
                id: user.id,
                email: user.email,
            },
            token,
            message: "Autenticação realizada com sucesso",
        });
    }
}


export { SessionsController };