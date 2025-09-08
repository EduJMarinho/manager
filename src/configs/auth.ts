import { env } from "../env";

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET não está definido no .env");
}

export const authConfig = {
    jwt: {
        secret: process.env.JWT_SECRET as string,
        expiresIn: "1d",
    },
};