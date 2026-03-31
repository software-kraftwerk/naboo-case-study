import { PayloadDto } from './jwtPayload.dto';
import { Request, Response } from 'express';

export interface ContextWithJWTPayload {
  jwtPayload: PayloadDto;
  req: Request;
  res: Response;
}
