import { Router, Request, Response } from 'express';
import { Routes, IRoute, IRouteParameter } from './Routes';
import Validator from './Validator';
import { ErrorResponse, IErrorData } from './ErrorResponse';
import { SuccessResponse, ISuccessData } from './SuccessResponse';
import { IParamType } from './Steady';
import { DefaultRouteHandler } from './DefaultRouteHandler';
import { StreamingRouteHandler } from './StreamingRouteHandler';

interface IFilesRequest extends Request {
  files?: any
}

export interface ITypesObject {
  [key: string]: IParamType;
}

export default class ApiRouter {

  public router: Router;
  public routes: Routes;
  public customTypes: ITypesObject;
  private controllers;

  constructor(routes: Routes, controllers, customTypes: IParamType[] = []) {
    this.router = Router();
    this.routes = routes;
    this.controllers = controllers;
    this.customTypes = customTypes.reduce((customTypes, type): ITypesObject => {
      customTypes[type.name] = type;
      return customTypes;
    }, {})

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
    });
  }

  // TODO: Use correct response format
  defaultAction(req: Request, res: Response, callback: (err, data?) => void) {
    return callback("Invalid action");
  }

  // TODO: Use correct response format
  setupRoute(route: IRoute): void {
    let controller = this.controllers[route.controller];
    let action = controller[route.action] || this.defaultAction;
    
    let authMethod = (req, res, next) => {
      return next();
    }

    if (route.authentication && route.authentication.controller && route.authentication.action) {
      authMethod = this.controllers[route.authentication.controller][route.authentication.action]();
    }

    this.router[route.method](route.url, authMethod, (req: IFilesRequest, res: Response) => {
      let values = route.method === 'get' ? req.query : req.body;
      const validator = new Validator(route.params, Object.assign({}, values, req.files));
      validator.addCustomTypes(this.customTypes);
      
      try {
        if (validator.isValid() === false) {
          const errorMessage = `This request failed validation, please check the documentation for ${route.method.toUpperCase()} ${route.url}`
          const err = new ErrorResponse({ req, res, errorMessage, errors: validator.getErrors(), status: 400 });
          return err.send();
        }
      } catch (e) {
        const errorMessage = e.message;
        const errors = [
          `Invalid route definition for ${route.method.toUpperCase()} ${route.url}`
        ];
        const err = new ErrorResponse({ req, res, errorMessage, errors, status: 501 });
        return err.send();
      }

      values = Object.assign(validator.values, req.params);

      let routeHandler;

      // streaming route
      if (route.streaming === true) {
        routeHandler = new StreamingRouteHandler(values, action, req, res);
      }

      // default route
      else {
        routeHandler = new DefaultRouteHandler(values, action, req, res);
      }

      // handle route
      routeHandler.handle();
      
    });
  }

}