import { Router } from "express";
import { UsersController } from "@/controllers/users-controller";

const usersRoutes = Router();
const usersController = new UsersController();

usersRoutes.post("/", usersController.create);
usersRoutes.get("/", usersController.list);
usersRoutes.delete("/:id", usersController.delete); // 👈 nova rota protegida

export { usersRoutes };