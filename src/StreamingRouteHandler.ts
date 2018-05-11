import { DefaultRouteHandler, IRouteHandlerAction } from './DefaultRouteHandler';
import { IErrorData, ErrorResponse } from './ErrorResponse';
import { ISuccessData, SuccessResponse } from './SuccessResponse';
import { Request, Response } from 'express';
import { EventEmitter } from 'events'
import { emit } from 'cluster';
import { spawn, ChildProcess } from 'child_process';

export class StreamingRouteHandler extends DefaultRouteHandler {

  constructor(values: object, action: IRouteHandlerAction, req: Request, res: Response) {
    super(values, action, req, res);
  }

  handle() {
    this.action(this.values, (err: IErrorData, emitter: ChildProcess, dataMapFunction) => {

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

      this.req.on('close', () => {
        emitter.kill('SIGHUP');
      });

      emitter.stdout.on("data", data => {
        
        data = data.toString();
        if (typeof dataMapFunction === 'function') {
          data = dataMapFunction(data);
        }

        const output = {
          type: "data",
          data: data
        }
        this.res.write(JSON.stringify(output) + "\n");
      });

      emitter.stderr.on("data", err => {

        err = err.toString();
        if (typeof dataMapFunction === 'function') {
          err = dataMapFunction(err);
        }

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