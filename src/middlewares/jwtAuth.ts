import { NextFunction, Request, Response } from 'express';
import { TokenAuth } from '../entities/AuthToken';
import { User } from '../database/models/User';

export const jwtAuth = (needsAdmin = false) => async (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  const token = authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token not found' });

  const tokenAuth = new TokenAuth();

  if (!tokenAuth.verify(token)) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const decoded = tokenAuth.decrypt(token);
  
  if (!decoded) return res.status(401).json({ message: 'Invalid token' });

  if (needsAdmin) {
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission' });
    }
  
    const verifyAdmin = await User.findOne({ email: decoded.email, role: 'admin' });
  
    if (!verifyAdmin) {
      return res.status(403).json({ message: 'You do not have permission' });
    }
  }
  
  next();
};
