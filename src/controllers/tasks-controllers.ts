import { Request, Response } from "express";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class TasksController {
    async create(request: Request, response: Response) {
        const { title, description, priority, assignedTo, teamId } = request.body;

        const validPriority = ["Alta", "Media", "Baixa"];
        if (!validPriority.includes(priority)) {
            return response.status(400).json({ error: "Prioridade inválida" });
        }

        try {
            const user = await prisma.user.findUnique({
                where: { id: Number(assignedTo) }
            });

            const team = await prisma.team.findUnique({
                where: { id: Number(teamId) }
            });

            if (!user) return response.status(404).json({ error: "Usuário não encontrado" });
            if (!team) return response.status(404).json({ error: "Time não encontrado" });

            const task = await prisma.task.create({
                data: {
                    title,
                    description,
                    status: "Pendente",
                    priority,
                    assignedTo: Number(assignedTo),
                    teamId: Number(teamId)
                },
                include: {
                    user: true,
                    team: true
                }
            });

            return response.status(201).json({
                status: task.status,
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                executor: task.user
                    ? {
                        id: task.user.id,
                        name: task.user.name
                    }
                    : null,
                team: task.team
                    ? {
                        id: task.team.id,
                        name: task.team.name
                    }
                    : null,
                created_at: task.createdAt,
                updated_at: task.updatedAt
            });
        } catch (error: any) {
            console.error("Erro ao criar tarefa:", error);
            return response.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    async list(request: Request, response: Response) {
        try {
            const tasks = await prisma.task.findMany({
                include: {
                    user: true,
                    team: true
                }
            });

            const formatted = tasks.map(task => ({
                status: task.status,
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                executor: task.user
                    ? {
                        id: task.user.id,
                        name: task.user.name
                    }
                    : null,
                team: task.team
                    ? {
                        id: task.team.id,
                        name: task.team.name
                    }
                    : null,
                created_at: task.createdAt,
                updated_at: task.updatedAt
            }));

            return response.status(200).json(formatted);
        } catch (error: any) {
            console.error("Erro ao listar tarefas:", error);
            return response.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    async updateStatus(request: Request, response: Response) {
        const { id } = request.params;
        const { status } = request.body;

        const validStatus = ["Pendente", "EmProgresso", "Concluida"];
        if (!validStatus.includes(status)) {
            return response.status(400).json({ error: "Status inválido" });
        }

        try {
            const task = await prisma.task.update({
                where: { id: Number(id) },
                data: { status },
                include: {
                    user: true,
                    team: true
                }
            });

            return response.status(200).json({
                status: task.status,
                id: task.id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                executor: task.user
                    ? {
                        id: task.user.id,
                        name: task.user.name
                    }
                    : null,
                team: task.team
                    ? {
                        id: task.team.id,
                        name: task.team.name
                    }
                    : null,
                created_at: task.createdAt,
                updated_at: task.updatedAt
            });
        } catch (error: any) {
            console.error("Erro ao atualizar status da tarefa:", error);
            return response.status(500).json({ error: "Erro interno do servidor", details: error.message });
        }
    }

    // ✅ Método protegido: apenas partner pode deletar
    async deleteTask(request: Request, response: Response) {
        const { id } = request.params;
        const requesterId = Number(request.user?.id); // 👈 conversão para number

        if (!requesterId) {
            throw new AppError("Usuário não autenticado", 401);
        }

        const requester = await prisma.user.findUnique({ where: { id: requesterId } });

        if (!requester || requester.role !== "partner") {
            throw new AppError("Apenas usuários com papel 'partner' podem remover tarefas", 403);
        }

        const task = await prisma.task.findUnique({ where: { id: Number(id) } });

        if (!task) {
            throw new AppError("Tarefa não encontrada", 404);
        }

        await prisma.task.delete({ where: { id: Number(id) } });

        return response.status(204).send();
    }
}

export { TasksController };