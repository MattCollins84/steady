import { Request, Response } from 'express';

export interface ISuccessData {
  req?: Request
  res?: Response
  status?: number
  data: object
}

export class SuccessResponse {
  
  private req: Request;
  private res: Response;
  private status: number = 200;
  private data: object;

  constructor(options: ISuccessData) {
    this.req = options.req;
    this.res = options.res;
    this.status = options.status || 200;
    this.data = options.data;
  }

  public send(): void {
    this.res.status(this.status).send(
      Object.assign(
        {},
        {
          data: this.data
        }
      )
    )
  }
}