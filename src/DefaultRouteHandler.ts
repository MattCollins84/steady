import { IErrorData, ErrorResponse } from './ErrorResponse';
import { ISuccessData, SuccessResponse } from './SuccessResponse';
import { Request, Response } from 'express';

export interface IRouteHandlerAction {
  params: object
  callback: (err: IErrorData, data?: ISuccessData) => void
}

export class DefaultRouteHandler {

  protected action;
  protected values;
  protected req;
  protected res;

  constructor(values: object, action: IRouteHandlerAction, req: Request, res: Response) {
    this.values = values;
    this.action = action;
    this.req = req;
    this.res = res;
  }

  handle() {
    return this.action(this.values, (err: IErrorData, data?: ISuccessData) => {
      if (err) {
        const response = new ErrorResponse({
          req: this.req,
          res: this.res,
          errorMessage: err.errorMessage,
          errors: err.errors,
          status: err.status
        });
        return response.send();
      }

      const response = new SuccessResponse({ req: this.req, res: this.res, data: data, status: 200 })
      return response.send();
    });
  }

}