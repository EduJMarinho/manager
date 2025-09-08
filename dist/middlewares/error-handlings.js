"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandling = errorHandling;
const AppError_1 = require("../utils/AppError");
const zod_1 = require("zod");
function errorHandling(error, request, response, next) {
    if (error instanceof AppError_1.AppError) {
        return response.status(error.statusCode).json({
            message: error.message
        });
    }
    if (error instanceof zod_1.ZodError) {
        return response.status(400).json({
            message: "validation error",
            issues: error.format(),
        });
    }
    return response.status(500).json({ message: error.message });
}
