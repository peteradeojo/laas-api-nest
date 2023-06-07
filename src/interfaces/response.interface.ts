import { Response } from "express";

export interface ServiceResponse<T = any> {
  success: boolean;
  statusCode: number;
  data?: T;
  message?: string;
}

export type SentResponse = Promise<Response>;