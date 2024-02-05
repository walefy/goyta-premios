import { NextFunction, Request, Response } from 'express';
import { TokenAuth } from '../entities/AuthToken';

export const isSameUser = (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  const token = authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token not found' });

  const tokenAuth = new TokenAuth();
  const decoded = tokenAuth.decrypt(token);

  if (!decoded) return res.status(401).json({ message: 'Invalid token' });

  const { id } = req.params;

  if (decoded.id !== id) {
    return res.status(403).json({ message: 'You do not have permission' });
  }

  next();
};
