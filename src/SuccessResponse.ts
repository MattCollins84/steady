import { Request, Response } from 'express';

export interface ISuccessResponseOptions {
  req: Request
  res: Response
  status?: number
  data: object
}

export interface ISuccessData {
  [key: string]: any
}

export class SuccessResponse {
  
  private req: Request;
  private res: Response;
  private status: number = 200;
  private data: object;

  constructor(options: ISuccessResponseOptions) {
    this.req = options.req;
    this.res = options.res;
    this.status = options.status || 200;
    this.data = options.data;
  }

  public send(): void {
    this.res.status(this.status).send(this.data);
  }
}