import { z } from "zod";

// Schema para usuário
export const UserSchema = z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email()
});

// Schema para time simplificado (usado em membros)
export const TeamLiteSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string()
});

// Schema para criação de time
export const CreateTeamSchema = z.object({
    name: z.string(),
    description: z.string()
});

// Membro sem campo `team` (usado em listagem de times)
export const MemberLiteSchema = z.object({
    role: z.string(),
    user: UserSchema
});

// Membro com campo `team` (usado em listagem de membros)
export const MemberSchema = z.object({
    role: z.string(),
    user: UserSchema,
    team: TeamLiteSchema
});

// Schema completo de time
export const TeamSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
    members: z.array(MemberLiteSchema)
});

export const TeamListSchema = z.array(TeamSchema);
export const MemberListSchema = z.array(MemberSchema);