"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsController = void 0;
const prisma_1 = require("../database/prisma");
const team_schema_1 = require("../schema/team-schema");
const AppError_1 = require("../utils/AppError");
class TeamsController {
    //  Criar time
    async create(request, response) {
        const parsed = team_schema_1.CreateTeamSchema.safeParse(request.body);
        if (!parsed.success) {
            return response.status(400).json({
                error: "Dados inválidos",
                details: parsed.error.errors
            });
        }
        const { name, description } = parsed.data;
        try {
            const team = await prisma_1.prisma.team.create({
                data: { name, description },
                include: {
                    members: {
                        include: { user: true }
                    }
                }
            });
            const parsedTeam = team_schema_1.TeamListSchema.parse([team])[0];
            return response.status(201).json({
                id: parsedTeam.id,
                name: parsedTeam.name,
                description: parsedTeam.description,
                created_at: parsedTeam.createdAt,
                updated_at: parsedTeam.updatedAt,
                members: parsedTeam.members.map(member => ({
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                    role: member.role
                }))
            });
        }
        catch (error) {
            console.error("Erro ao criar time:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    //  Listar todos os times
    async list(request, response) {
        try {
            const teams = await prisma_1.prisma.team.findMany({
                include: {
                    members: {
                        include: { user: true }
                    }
                }
            });
            const parsed = team_schema_1.TeamListSchema.parse(teams);
            const formatted = parsed.map(team => ({
                id: team.id,
                name: team.name,
                description: team.description,
                created_at: team.createdAt,
                updated_at: team.updatedAt,
                members: team.members.map(member => ({
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                    role: member.role
                }))
            }));
            return response.json(formatted);
        }
        catch (error) {
            console.error("Erro ao listar times:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    //  Listar todos os membros com seus times
    async listMembers(request, response) {
        try {
            const members = await prisma_1.prisma.team_Member.findMany({
                include: {
                    user: true,
                    team: true
                }
            });
            const parsed = team_schema_1.MemberListSchema.parse(members);
            const formatted = parsed.map(member => ({
                user: {
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email
                },
                role: member.role,
                team: {
                    id: member.team.id,
                    name: member.team.name,
                    description: member.team.description
                }
            }));
            return response.json(formatted);
        }
        catch (error) {
            console.error("Erro ao listar membros:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    // ✅ Remover time (apenas partner)
    async delete(request, response) {
        const { id } = request.params;
        const requesterId = Number(request.user?.id);
        if (!requesterId) {
            throw new AppError_1.AppError("Usuário não autenticado", 401);
        }
        try {
            const requester = await prisma_1.prisma.user.findUnique({
                where: { id: requesterId }
            });
            if (!requester || requester.role !== "partner") {
                throw new AppError_1.AppError("Apenas usuários com papel 'partner' podem remover times", 403);
            }
            const team = await prisma_1.prisma.team.findUnique({
                where: { id: Number(id) }
            });
            if (!team) {
                throw new AppError_1.AppError("Time não encontrado", 404);
            }
            await prisma_1.prisma.team.delete({
                where: { id: Number(id) }
            });
            return response.status(204).send();
        }
        catch (error) {
            console.error("Erro ao remover time:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    //  Mostrar time específico com membros
    async show(request, response) {
        const teamId = Number(request.params.id);
        try {
            const team = await prisma_1.prisma.team.findUnique({
                where: { id: teamId },
                include: {
                    members: {
                        include: { user: true }
                    }
                }
            });
            if (!team) {
                return response.status(404).json({ error: "Time não encontrado" });
            }
            return response.json(team);
        }
        catch (error) {
            console.error("Erro ao buscar time:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }
    //  Adicionar membro a um time
    async addMember(request, response) {
        const teamId = Number(request.params.id);
        const { userId, role } = request.body;
        try {
            const member = await prisma_1.prisma.team_Member.create({
                data: {
                    team_id: teamId,
                    user_id: userId,
                    role
                },
                include: {
                    user: true,
                    team: true
                }
            });
            return response.status(201).json(member);
        }
        catch (error) {
            console.error("Erro ao adicionar membro:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }
}
exports.TeamsController = TeamsController;
