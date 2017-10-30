import { Router, Request, Response } from 'express';
import { Routes, IRoute, IRouteParameter } from './Routes';
import Validator from './Validator';
import { ErrorResponse, IErrorData } from './ErrorResponse';
import { SuccessResponse, ISuccessData } from './SuccessResponse';

export default class ApiRouter {

  public router: Router;
  public routes: Routes;
  private controllers;

  constructor(routes: Routes, controllers) {
    this.router = Router();
    this.routes = routes;
    this.controllers = controllers;

    this.routes.routes.forEach(route => {
      switch (route.method.toLowerCase()) {
        case "get":
        case "post":
        case "put":
        case "delete":
          this.setupRoute(route);
          break;
        default:
          console.error(`Invalid route method ${route.method}`);
          break;
      }
    })
  }

  // TODO: Use correct response format
  defaultAction(req: Request, res: Response, callback: (err, data?) => void) {
    return callback("Invalid action");
  }

  // TODO: Use correct response format
  setupRoute(route: IRoute): void {
    let controller = this.controllers[route.controller];
    let action = controller[route.action] || this.defaultAction;
    this.router[route.method](route.url, (req: Request, res: Response) => {

      let values = route.method === 'get' ? req.query : req.body;
      const validator = new Validator(route.params, values);

      if (validator.isValid() === false) {
        const errorMessage = `This request failed validation, please check the documentation for ${route.method.toUpperCase()} ${route.url}`
        const err = new ErrorResponse({ req, res, errorMessage, errors: validator.getErrors(), status: 400 });
        return err.send();
      }

      values = Object.assign(values, req.params);

      return action(values, (err: IErrorData, data?: ISuccessData) => {
        if (err) {
          const response = new ErrorResponse({
            req: req,
            res: res,
            errorMessage: err.errorMessage,
            errors: err.errors,
            status: err.status
          });
          return response.send();
        }

        const response = new SuccessResponse({ req, res, data: data, status: data.status || 200 })
        return response.send();
      })
    });
  }

}