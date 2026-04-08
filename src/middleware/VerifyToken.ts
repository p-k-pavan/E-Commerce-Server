import { Request, Response, NextFunction } from 'express';
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  role: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      role?: string;
      name?: string;
    }
  }
}

const VerifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.NammaMart;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    req.userId = decoded.userId;
    req.role = decoded.role; 
    req.name = decoded.name;  

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }
};

export default VerifyToken;