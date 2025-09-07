import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { z } from "zod";
import { authConfig } from "@/configs/auth";

interface TokenPayload {
    sub: string;
}

class UsersController {
    // Criar novo usuário
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(3),
            email: z.string().email(),
            password: z.string().min(6),
            role: z.enum(["partner", "collaborator"])
        });

        const { name, email, password, role } = bodySchema.parse(request.body);

        const userWithSameEmail = await prisma.user.findFirst({ where: { email } });

        if (userWithSameEmail) {
            throw new AppError("Já existe um usuário com esse e-mail");
        }

        const hashedPassword = await hash(password, 8);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                role,
                password: hashedPassword
            }
        });

        return response.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.createdAt,
            updated_at: user.updatedAt
        });
    }

    // Autenticar usuário e gerar token
    async login(request: Request, response: Response) {
        const bodySchema = z.object({
            email: z.string().email(),
            password: z.string().min(6)
        });

        const { email, password } = bodySchema.parse(request.body);

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new AppError("email e/ou senha inválida", 401);
        }

        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
            throw new AppError("email e/ou senha inválida", 401);
        }

        const token = sign({}, authConfig.jwt.secret, {
            subject: String(user.id),
            expiresIn: authConfig.jwt.expiresIn
        });

        return response.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }

    // Listar todos os usuários
    async list(request: Request, response: Response) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            const formatted = users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.createdAt,
                updated_at: user.updatedAt
            }));

            return response.json(formatted);
        } catch (error) {
            console.error("Erro ao listar usuários:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    // Deletar usuário (somente partner)
    async delete(request: Request, response: Response) {
        const paramsSchema = z.object({
            id: z.coerce.number().int().positive()
        });

        const { id: userId } = paramsSchema.parse(request.params);

        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new AppError("Token não fornecido", 401);
        }

        const [, token] = authHeader.split(" ");
        let decoded: TokenPayload;

        try {
            decoded = verify(token, authConfig.jwt.secret) as TokenPayload;
        } catch {
            throw new AppError("Token inválido", 401);
        }

        const requestingUser = await prisma.user.findUnique({
            where: { id: Number(decoded.sub) }
        });

        if (!requestingUser || requestingUser.role !== "partner") {
            throw new AppError("Apenas usuários com papel 'partner' podem excluir usuários", 403);
        }

        if (requestingUser.id === userId) {
            throw new AppError("Você não pode excluir a si mesmo", 403);
        }

        const userToDelete = await prisma.user.findUnique({ where: { id: userId } });

        if (!userToDelete) {
            throw new AppError("Usuário não encontrado", 404);
        }

        await prisma.user.delete({ where: { id: userId } });

        return response.status(204).send();
    }
}

export { UsersController };