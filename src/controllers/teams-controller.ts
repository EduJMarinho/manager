import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import {
    TeamListSchema,
    MemberListSchema,
    CreateTeamSchema
} from "@/schema/team-schema";
import { AppError } from "@/utils/AppError";

class TeamsController {
    // ✅ Criar time
    async create(request: Request, response: Response) {
        const parsed = CreateTeamSchema.safeParse(request.body);

        if (!parsed.success) {
            return response.status(400).json({
                error: "Dados inválidos",
                details: parsed.error.errors
            });
        }

        const { name, description } = parsed.data;

        try {
            const team = await prisma.team.create({
                data: { name, description },
                include: {
                    members: {
                        include: { user: true }
                    }
                }
            });

            const parsedTeam = TeamListSchema.parse([team])[0];

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
        } catch (error: unknown) {
            console.error("Erro ao criar time:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    // ✅ Listar todos os times
    async list(request: Request, response: Response) {
        try {
            const teams = await prisma.team.findMany({
                include: {
                    members: {
                        include: { user: true }
                    }
                }
            });

            const parsed = TeamListSchema.parse(teams);

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
        } catch (error: unknown) {
            console.error("Erro ao listar times:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    // ✅ Listar todos os membros com seus times
    async listMembers(request: Request, response: Response) {
        try {
            const members = await prisma.team_Member.findMany({
                include: {
                    user: true,
                    team: true
                }
            });

            const parsed = MemberListSchema.parse(members);

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
        } catch (error: unknown) {
            console.error("Erro ao listar membros:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    // ✅ Remover time (apenas partner)
    async delete(request: Request, response: Response) {
        const { id } = request.params;
        const requesterId = Number(request.user?.id);

        if (!requesterId) {
            throw new AppError("Usuário não autenticado", 401);
        }

        try {
            const requester = await prisma.user.findUnique({
                where: { id: requesterId }
            });

            if (!requester || requester.role !== "partner") {
                throw new AppError("Apenas usuários com papel 'partner' podem remover times", 403);
            }

            const team = await prisma.team.findUnique({
                where: { id: Number(id) }
            });

            if (!team) {
                throw new AppError("Time não encontrado", 404);
            }

            await prisma.team.delete({
                where: { id: Number(id) }
            });

            return response.status(204).send();
        } catch (error: unknown) {
            console.error("Erro ao remover time:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    // ✅ Mostrar time específico com membros
    async show(request: Request, response: Response) {
        const teamId = Number(request.params.id);

        try {
            const team = await prisma.team.findUnique({
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
        } catch (error: unknown) {
            console.error("Erro ao buscar time:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }

    // ✅ Adicionar membro a um time
    async addMember(request: Request, response: Response) {
        const teamId = Number(request.params.id);
        const { userId, role } = request.body;

        try {
            const member = await prisma.team_Member.create({
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
        } catch (error: unknown) {
            console.error("Erro ao adicionar membro:", error);
            return response.status(500).json({ error: "Erro interno do servidor" });
        }
    }
}

export { TeamsController };