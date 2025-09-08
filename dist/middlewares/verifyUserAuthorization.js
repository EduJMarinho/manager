"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserAuthorization = verifyUserAuthorization;
const AppError_1 = require("../utils/AppError");
function verifyUserAuthorization(role) {
    return (request, response, next) => {
        if (!request.user) {
            throw new AppError_1.AppError("Não Autorizado", 401);
        }
        if (!role.includes(request.user.role)) {
            throw new AppError_1.AppError("Não Autorizado", 401);
        }
        return next();
    };
}
