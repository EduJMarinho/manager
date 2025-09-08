"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const prisma_1 = require("../database/prisma");
const AppError_1 = require("../utils/AppError");
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const zod_1 = require("zod");
const auth_1 = require("../configs/auth");
class UsersController {
    // Criar novo usuário
    async create(request, response) {
        const bodySchema = zod_1.z.object({
            name: zod_1.z.string().trim().min(3),
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(6),
            role: zod_1.z.enum(["partner", "collaborator"])
        });
        const { name, email, password, role } = bodySchema.parse(request.body);
        const userWithSameEmail = await prisma_1.prisma.user.findFirst({ where: { email } });
        if (userWithSameEmail) {
            throw new AppError_1.AppError("Já existe um usuário com esse e-mail");
        }
        const hashedPassword = await (0, bcrypt_1.hash)(password, 8);
        const user = await prisma_1.prisma.user.create({
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
    async login(request, response) {
        const bodySchema = zod_1.z.object({
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(6)
        });
        const { email, password } = bodySchema.parse(request.body);
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError_1.AppError("email e/ou senha inválida", 401);
        }
        const passwordMatch = await (0, bcrypt_1.compare)(password, user.password);
        if (!passwordMatch) {
            throw new AppError_1.AppError("email e/ou senha inválida", 401);
        }
        const token = (0, jsonwebtoken_1.sign)({}, auth_1.authConfig.jwt.secret, {
            subject: String(user.id),
            expiresIn: auth_1.authConfig.jwt.expiresIn
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
    async list(request, response) {
        try {
            const users = await prisma_1.prisma.user.findMany({
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
        }
        catch (error) {
            console.error("Erro ao listar usuários:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    // Deletar usuário (somente partner)
    async delete(request, response) {
        const paramsSchema = zod_1.z.object({
            id: zod_1.z.coerce.number().int().positive()
        });
        const { id: userId } = paramsSchema.parse(request.params);
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new AppError_1.AppError("Token não fornecido", 401);
        }
        const [, token] = authHeader.split(" ");
        let decoded;
        try {
            decoded = (0, jsonwebtoken_1.verify)(token, auth_1.authConfig.jwt.secret);
        }
        catch {
            throw new AppError_1.AppError("Token inválido", 401);
        }
        const requestingUser = await prisma_1.prisma.user.findUnique({
            where: { id: Number(decoded.sub) }
        });
        if (!requestingUser || requestingUser.role !== "partner") {
            throw new AppError_1.AppError("Apenas usuários com papel 'partner' podem excluir usuários", 403);
        }
        if (requestingUser.id === userId) {
            throw new AppError_1.AppError("Você não pode excluir a si mesmo", 403);
        }
        const userToDelete = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!userToDelete) {
            throw new AppError_1.AppError("Usuário não encontrado", 404);
        }
        await prisma_1.prisma.user.delete({ where: { id: userId } });
        return response.status(204).send();
    }
}
exports.UsersController = UsersController;
