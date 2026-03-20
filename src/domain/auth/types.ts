export interface UserAccountRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionTokenPayload extends SessionUser {
  iat: number;
  exp: number;
}
