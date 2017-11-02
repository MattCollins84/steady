
/// <reference types="express" />
/// <reference types="joi" />

import * as Joi from 'joi';
import { RequestHandler } from 'express';
  
declare class Steady {
    constructor(options: ISteadyOptions)
  }
declare module Steady { }
export = Steady
  
interface ISteadyOptions {
  controllersDir: string,
  routesDir: string,
  port?: number,
  apiName?: string,
  docsPath?: string,
  apiPath?: string,
  customTypes?: ICustomType[],
  middleware?: RequestHandler[]
}
interface ICustomType {
  name: string
  validation: Joi.AnySchema
  example?: string
}