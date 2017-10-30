import { Request, Response } from 'express';

export interface IErrorData {
  req?: Request
  res?: Response
  errorMessage: string
  errors: string[]
  status: number
}

export class ErrorResponse {
  
  private req: Request;
  private res: Response;
  private status: number;
  private errorMessage: string;
  private errors: string[];

  constructor(options: IErrorData) {
    this.req = options.req;
    this.res = options.res;
    this.status = options.status;
    this.errorMessage = options.errorMessage;
    this.errors = options.errors;
  }

  public send(): void {
    const requestInfo = {
      request: {
        method: this.req.method,
        url: this.req.url,
        body: this.req.body || {},
        query: this.req.query || {}
      } 
    }
    this.res.status(this.status).send(
      Object.assign(
        {},
        {
          errorMessage: this.errorMessage,
          errors: this.errors
        },
        requestInfo
      )
    )
  }

}