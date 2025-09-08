"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRoutes = void 0;
const express_1 = require("express");
const tasks_controllers_1 = require("../controllers/tasks-controllers");
const ensure_authenticated_1 = require("../middlewares/ensure-authenticated");
const verifyUserAuthorization_1 = require("../middlewares/verifyUserAuthorization");
const tasksRoutes = (0, express_1.Router)();
exports.tasksRoutes = tasksRoutes;
const tasksController = new tasks_controllers_1.TasksController();
// Protege apenas o POST (apenas parceiros podem criar tarefas)
tasksRoutes.post("/", ensure_authenticated_1.ensureAuthenticated, (0, verifyUserAuthorization_1.verifyUserAuthorization)(["partner"]), tasksController.create);
// GET liberado, sem autenticação
tasksRoutes.get("/", tasksController.list);
// PATCH para atualizar status — apenas autenticado, sem restrição de papel
tasksRoutes.patch("/:id/status", ensure_authenticated_1.ensureAuthenticated, tasksController.updateStatus);
//  DELETE — apenas parceiros autenticados com token podem deletar tarefas
tasksRoutes.delete("/:id", ensure_authenticated_1.ensureAuthenticated, (0, verifyUserAuthorization_1.verifyUserAuthorization)(["partner"]), tasksController.deleteTask);
