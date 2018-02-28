
/// <reference types="express" />
/// <reference types="joi" />

import * as Joi from 'joi';
import { RequestHandler, ErrorRequestHandler } from 'express';
  
export class Steady {
  constructor(options: ISteadyOptions)
  attachment(name: string)
  get(url: string, handler: RequestHandler)
  post(url: string, handler: RequestHandler)
  put(url: string, handler: RequestHandler)
  delete(url: string, handler: RequestHandler)
  all(url: string, handler: RequestHandler)
}

export interface IHttpAttach {
  [key: string]: any;
}

export interface ISteadyOptions {
  controllersDir: string,
  routesDir: string,
  port?: number,
  apiName?: string,
  docsPath?: string,
  disableDocs?: boolean
  apiPath?: string,
  customTypes?: IParamType[],
  middleware?: (RequestHandler|ErrorRequestHandler)[],
  staticContentDir?: string
  httpAttach?: IHttpAttach
}
export interface IParamType {
  name: string
  description: string
  validator: (any)
  example: any
}
export interface IErrorData {
  errorMessage: string
  errors: string[]
  status: number
}
export interface ISuccessData {
  [key: string]: any
}