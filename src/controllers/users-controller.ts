import { Request, Response, NextFunction } from "express";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { hash } from "bcrypt";
import { z } from "zod";
import { afterEach } from "node:test";

class UsersController {
    async create(request: Request, response: Response) {
        const bodySchema = z.object({
            name: z.string().trim().min(3),
            email: z.string().email(),
            password: z.string().min(6),
            role: z.enum(["partner", "collaborator"])
        });

        const { name, email, password, role } = bodySchema.parse(request.body);

        const userWithSameEmail = await prisma.user.findFirst({ where: { email } });

        if (userWithSameEmail) {
            throw new AppError("Já existe um usuário com esse e-mail")
        }

        const hashedpassword = await hash(password, 8);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                role,
                password: hashedpassword
            }
        })

        return response.status(201).json(user);
    }
}

export { UsersController };