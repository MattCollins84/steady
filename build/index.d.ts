
/// <reference types="express" />
/// <reference types="joi" />

import * as Joi from 'joi';
import { RequestHandler, ErrorRequestHandler } from 'express';
  
export class Steady {
  constructor(options: ISteadyOptions)
  get(url: string, handler: RequestHandler)
  post(url: string, handler: RequestHandler)
  put(url: string, handler: RequestHandler)
  delete(url: string, handler: RequestHandler)
  all(url: string, handler: RequestHandler)
}
  
export interface ISteadyOptions {
  controllersDir: string,
  routesDir: string,
  port?: number,
  apiName?: string,
  docsPath?: string,
  apiPath?: string,
  customTypes?: ICustomType[],
  middleware?: (RequestHandler|ErrorRequestHandler)[],
  staticContentDir?: string
}
export interface ICustomType {
  name: string
  validation: Joi.AnySchema
  example?: string
}
export interface IErrorData {
  errorMessage: string
  errors: string[]
  status: number
}
export interface ISuccessData {
  [key: string]: any
}