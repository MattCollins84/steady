import { DefaultRouteHandler, IRouteHandlerAction } from './DefaultRouteHandler';
import { IErrorData, ErrorResponse } from './ErrorResponse';
import { ISuccessData, SuccessResponse } from './SuccessResponse';
import { Request, Response } from 'express';
import { EventEmitter } from 'events'
import { emit } from 'cluster';

export class StreamingRouteHandler extends DefaultRouteHandler {

  constructor(values: object, action: IRouteHandlerAction, req: Request, res: Response) {
    super(values, action, req, res);
  }

  handle() {
    this.action(this.values, (err: IErrorData, emitter?: EventEmitter) => {
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

      // write the headers
      this.res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      emitter.on("data", data => {
        const output = {
          type: "data",
          data: data
        }
        this.res.write(JSON.stringify(output) + "\n");
      });

      emitter.on("error", err => {
        const output = {
          type: "error",
          data: err
        };
        this.res.write(JSON.stringify(output) + "\n");
      })

      emitter.on("close", data => {
        emitter.removeAllListeners();
        this.res.end()
      })

    });
  }

}