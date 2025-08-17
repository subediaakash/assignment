import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import type { RegisterUserDto, LoginUserDto } from "./auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password }: RegisterUserDto = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      const result = await AuthService.registerUser({ email, password });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (
        error instanceof Error &&
        error.message === "User with this email already exists"
      ) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error during registration",
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginUserDto = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
      }

      const result = await AuthService.loginUser({ email, password });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: result.user,
          token: result.token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);

      if (
        error instanceof Error &&
        error.message === "Invalid email or password"
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error during login",
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const user = await AuthService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        data: { user },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
