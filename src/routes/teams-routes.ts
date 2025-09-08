import { Router } from "express";
import { TeamsController } from "../controllers/teams-controller";
import { ensureAuthenticated } from "../middlewares/ensure-authenticated";

const teamsRoutes = Router();
const teamsController = new TeamsController();

teamsRoutes.post("/", ensureAuthenticated, teamsController.create.bind(teamsController));
teamsRoutes.get("/", teamsController.list.bind(teamsController));
teamsRoutes.get("/members", teamsController.listMembers.bind(teamsController));
teamsRoutes.get("/:id", teamsController.show.bind(teamsController));
teamsRoutes.post("/:id/members", ensureAuthenticated, teamsController.addMember.bind(teamsController));
teamsRoutes.delete("/:id", ensureAuthenticated, teamsController.delete.bind(teamsController));

export { teamsRoutes };