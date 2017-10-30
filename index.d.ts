// Type definitions for Steady

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */

import * as express from 'express';

declare module Steady {
  /*~ Write your module's methods and properties in this class */
  class Steady {
      constructor(options: ISteadyOptions);
      use(middleware: express.RequestHandler | express.ErrorRequestHandler): void;
      get(url: string, handler: express.RequestHandler): void;
      post(url: string, handler: express.RequestHandler): void;
      put(url: string, handler: express.RequestHandler): void;
      delete(url: string, handler: express.RequestHandler): void;
      all(url: string, handler: express.RequestHandler): void;
  }

  export interface ISteadyOptions {
    controllersDir: string,
    routesDir: string,
    port?: number,
    apiName?: string,
    docsPath?: string,
    apiPath?: string
  }
}


declare module 'steady' {
  var out: typeof Steady.Steady
  export = out;
}