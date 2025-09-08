"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberListSchema = exports.TeamListSchema = exports.TeamSchema = exports.MemberSchema = exports.MemberLiteSchema = exports.CreateTeamSchema = exports.TeamLiteSchema = exports.UserSchema = void 0;
const zod_1 = require("zod");
// Schema para usuário
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    email: zod_1.z.string().email()
});
// Schema para time simplificado (usado em membros)
exports.TeamLiteSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    description: zod_1.z.string()
});
// Schema para criação de time
exports.CreateTeamSchema = zod_1.z.object({
    name: zod_1.z.string(),
    description: zod_1.z.string()
});
// Membro sem campo `team` (usado em listagem de times)
exports.MemberLiteSchema = zod_1.z.object({
    role: zod_1.z.string(),
    user: exports.UserSchema
});
// Membro com campo `team` (usado em listagem de membros)
exports.MemberSchema = zod_1.z.object({
    role: zod_1.z.string(),
    user: exports.UserSchema,
    team: exports.TeamLiteSchema
});
// Schema completo de time
exports.TeamSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    createdAt: zod_1.z.date(),
    updatedAt: zod_1.z.date().nullable(),
    members: zod_1.z.array(exports.MemberLiteSchema)
});
exports.TeamListSchema = zod_1.z.array(exports.TeamSchema);
exports.MemberListSchema = zod_1.z.array(exports.MemberSchema);
