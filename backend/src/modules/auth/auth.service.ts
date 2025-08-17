import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient();

export interface RegisterUserDto {
  email: string;
  password: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
}

export class AuthService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

  static async registerUser(
    userData: RegisterUserDto
  ): Promise<{ user: AuthUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
        },
      });

      // Generate JWT token
      const token = this.generateToken(user.id);

      return { user, token };
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  }

  static async loginUser(
    credentials: LoginUserDto
  ): Promise<{ user: AuthUser; token: string }> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );
      if (!isPasswordValid) {
        throw new Error("Invalid email or password");
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
      };

      return { user: authUser, token };
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error;
    }
  }

  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  static verifyToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  private static generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }
}
