"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsController = void 0;
const prisma_1 = require("../database/prisma");
const bcrypt_1 = require("bcrypt");
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const auth_1 = require("../configs/auth");
const jsonwebtoken_1 = require("jsonwebtoken");
class SessionsController {
    async create(request, response) {
        // Validação do corpo da requisição
        const bodySchema = zod_1.z.object({
            email: zod_1.z.string().email(),
            password: zod_1.z.string().min(6),
        });
        const { email, password } = bodySchema.parse(request.body);
        // Busca do usuário pelo e-mail
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new AppError_1.AppError("email e/ou senha inválida", 401);
        }
        // Verificação da senha
        const passwordMatched = await (0, bcrypt_1.compare)(password, user.password);
        if (!passwordMatched) {
            throw new AppError_1.AppError("email e/ou senha inválida", 401);
        }
        // Garante que o secret está definido
        if (!auth_1.authConfig.jwt.secret) {
            throw new Error("JWT_SECRET não está definido nas variáveis de ambiente");
        }
        // Geração do token JWT
        const token = (0, jsonwebtoken_1.sign)({ role: user.role ?? "collaborator" }, auth_1.authConfig.jwt.secret, {
            subject: String(user.id),
            expiresIn: auth_1.authConfig.jwt.expiresIn,
        });
        // Retorno da resposta com token e dados mínimos do usuário
        return response.json({
            message: "Autenticação realizada com sucesso",
            name: user.name,
            role: user.role,
            id: user.id,
            token,
        });
    }
}
exports.SessionsController = SessionsController;
