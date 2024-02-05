export type CreationPayloadType = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type TokenPayload = CreationPayloadType & {
  iat: number;
  exp: number;
}