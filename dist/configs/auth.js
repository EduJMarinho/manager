"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfig = void 0;
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não está definido no .env");
}
exports.authConfig = {
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: "1d",
    },
};
