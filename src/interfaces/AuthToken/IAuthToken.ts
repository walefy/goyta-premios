import { CreationPayloadType, TokenPayload } from './TokenPayload';

export interface IAuthToken {
  sign(payload: CreationPayloadType): string;
  decrypt(token: string): TokenPayload | null;
  verify(token: string): boolean;
}
