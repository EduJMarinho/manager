import { Router } from "express";
import { usersRoutes } from "./users-routes";
import { sessionsRoutes } from "./sessions-routes";
import { tasksRoutes } from "./tasks-routes";
import { teamsRoutes } from "./teams-routes";


const routes = Router();

routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);
routes.use("/tasks", tasksRoutes);
routes.use("/teams", teamsRoutes); // 👈 nova rota registrada

export { routes };