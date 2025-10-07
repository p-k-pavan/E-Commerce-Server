import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";

// Define JWT payload interface
interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// Correct middleware function
const VerifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.ShopEase;
  console.log("Token:", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.userId = decoded.userId;
    console.log("Decoded userId:", req.userId);
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
};

export default VerifyToken;