import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { env } from './env';
import { HttpError } from './errors';

export interface AuthContext {
  userId: number;
  providerId: string;
  email: string;
}

export interface PublicUser {
  id: number;
  email: string;
  name: string;
  providerId: string;
}

interface TokenPayload {
  sub: number;
  providerId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

const TOKEN_TTL = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export function signToken(user: PublicUser): string {
  const payload: TokenPayload = {
    sub: user.id,
    providerId: user.providerId,
    email: user.email,
  };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function readToken(token: string): AuthContext {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string') {
      throw new HttpError(401, 'Sessão inválida');
    }
    const userId = Number(decoded.sub);
    const providerId =
      typeof decoded.providerId === 'string' ? decoded.providerId : '';
    const email = typeof decoded.email === 'string' ? decoded.email : '';
    if (!userId || !providerId || !email) {
      throw new HttpError(401, 'Sessão inválida');
    }
    return { userId, providerId, email };
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError(401, 'Sessão inválida ou expirada');
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    next(new HttpError(401, 'Faça login para continuar'));
    return;
  }
  try {
    req.auth = readToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

export function authOf(req: Request): AuthContext {
  if (!req.auth) throw new HttpError(401, 'Faça login para continuar');
  return req.auth;
}

export function toPublicUser(user: {
  id: number;
  email: string;
  name: string;
  providerId: string;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    providerId: user.providerId,
  };
}
