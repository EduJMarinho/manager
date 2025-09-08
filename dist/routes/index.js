"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = void 0;
const express_1 = require("express");
const users_routes_1 = require("./users-routes");
const sessions_routes_1 = require("./sessions-routes");
const tasks_routes_1 = require("./tasks-routes");
const teams_routes_1 = require("./teams-routes");
const routes = (0, express_1.Router)();
exports.routes = routes;
routes.use("/users", users_routes_1.usersRoutes);
routes.use("/sessions", sessions_routes_1.sessionsRoutes);
routes.use("/tasks", tasks_routes_1.tasksRoutes);
routes.use("/teams", teams_routes_1.teamsRoutes); // 👈 nova rota registrada
