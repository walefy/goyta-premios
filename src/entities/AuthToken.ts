import jwt from 'jsonwebtoken';
import { TokenPayload, CreationPayloadType } from '../interfaces/AuthToken/TokenPayload';
import { IAuthToken } from '../interfaces/AuthToken/IAuthToken';

export class TokenAuth implements IAuthToken {
  #secretKey: string;

  constructor() {
    this.#secretKey = process.env.JWT_SECRET_KEY || 'secretKeyToken@12$56';
  }

  sign(payload: CreationPayloadType) {
    return jwt.sign(payload, this.#secretKey);
  }

  decrypt(token: string) {
    const decoded = jwt.decode(token);
    if (typeof decoded === 'string' || !decoded) return null;
    return decoded as TokenPayload;
  }

  verify(token: string) {
    try {
      jwt.verify(token, this.#secretKey);
      return true;
    } catch {
      return false;
    }
  }
}