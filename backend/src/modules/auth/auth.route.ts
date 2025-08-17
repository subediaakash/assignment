import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "./auth.middleware";

const authRouter = Router();

// Public routes
authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);

// Protected routes
authRouter.get("/profile", authMiddleware, AuthController.getProfile);

export { authRouter };
