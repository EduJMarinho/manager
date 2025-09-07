import { Router } from "express";
import { TasksController } from "@/controllers/tasks-controllers";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization";

const tasksRoutes = Router();
const tasksController = new TasksController();

// Protege apenas o POST (apenas parceiros podem criar tarefas)
tasksRoutes.post(
    "/",
    ensureAuthenticated,
    verifyUserAuthorization(["partner"]),
    tasksController.create
);

// GET liberado, sem autenticação
tasksRoutes.get("/", tasksController.list);

// PATCH para atualizar status — apenas autenticado, sem restrição de papel
tasksRoutes.patch(
    "/:id/status",
    ensureAuthenticated,
    tasksController.updateStatus
);

// ✅ DELETE — apenas parceiros autenticados com token podem deletar tarefas
tasksRoutes.delete(
    "/:id",
    ensureAuthenticated,
    verifyUserAuthorization(["partner"]),
    tasksController.deleteTask
);

export { tasksRoutes };