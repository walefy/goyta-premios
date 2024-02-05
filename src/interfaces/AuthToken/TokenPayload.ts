export type CreationPayloadType = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

export type TokenPayload = CreationPayloadType & {
  iat: number;
  exp: number;
}