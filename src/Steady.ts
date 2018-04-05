import * as http from 'http';
import * as fs from 'fs';
import * as aa from 'ascii-art';
import * as Joi from 'joi';
import { ErrorRequestHandler, RequestHandler, Request, Response, NextFunction } from 'express';
import Server from './Server';
import { IServerOptions } from './Server';

export interface IHttpAttach {
  [key: string]: any;
}

export interface IDocsMeta {
  copyright?: string;
}

export interface ISteadyOptions {
  controllersDir: string,
  routesDir: string,
  port?: number,
  apiName?: string,
  docsPath?: string,
  disableDocs?: boolean,
  apiPath?: string,
  customTypes?: IParamType[],
  middleware?: (RequestHandler|ErrorRequestHandler)[],
  staticContentDir?: string,
  httpAttach?: IHttpAttach
  docsMeta?: IDocsMeta
}

export interface IParamType {
  name: string
  description: string
  validator: (any)
  example: any
}

export class Steady {

  private apiName: string = 'API';
  private docsPath: string = '/docs';
  private disableDocs: boolean = false;
  private apiPath: string = '/';
  private staticContentDir: string = null;
  private httpAttach: IHttpAttach = {};
  private docsMeta: IDocsMeta = {};
  private customTypes: IParamType[] = [];
  private middleware: (RequestHandler|ErrorRequestHandler)[] = [];
  private controllersDir: string;
  private routesDir: string;
  private port: number = 5000;
  private serverConfig: IServerOptions;
  private server: Server;
  private routes;
  private controllers;
  private httpServer;

  constructor(options: ISteadyOptions) {
    
    // required options
    this.controllersDir = options.controllersDir;
    this.routesDir = options.routesDir;
    
    // optional configuration
    this.port = options.port ? options.port : this.port;
    this.apiName = options.apiName ? options.apiName : this.apiName;
    this.docsPath = options.docsPath ? options.docsPath : this.docsPath;
    this.disableDocs = options.disableDocs ? options.disableDocs : this.disableDocs;
    this.apiPath = options.apiPath ? options.apiPath : this.apiPath;
    this.staticContentDir = options.staticContentDir ? options.staticContentDir : this.staticContentDir;
    this.httpAttach = options.httpAttach ? options.httpAttach : this.httpAttach;
    this.docsMeta = options.docsMeta ? options.docsMeta : this.docsMeta;

    // middleware
    this.middleware = options.middleware ? options.middleware : this.middleware;

    // create custom types
    this.customTypes = options.customTypes ? options.customTypes : this.customTypes
    
    // load routes and controllers and generate server configuration
    try {
      this.loadRoutes();
      this.loadControllers();
      this.generateServerConfig();

      // create new server instance
      this.server = new Server(this.routes, this.controllers, this.serverConfig);
      this.server.app.set('port', this.port);
      this.startHttpServer();
    } catch (e) {
      console.error(e);
      process.exit(0);
    }
  }

  // Get attached http functionality (Socket.io etc...)
  public attachment(name: string): any {
    return this.server.app.get(name);
  }

  // Wrap Express get request handler
  public get(url: string, handler: RequestHandler): void {
    this.server.app.get(url, handler);
  }
  
  // Wrap Express post request handler
  public post(url: string, handler: RequestHandler): void {
    this.server.app.post(url, handler);
  }
  
  // Wrap Express put request handler
  public put(url: string, handler: RequestHandler): void {
    this.server.app.put(url, handler);
  }

  // Wrap Express delete request handler
  public delete(url: string, handler: RequestHandler): void {
    this.server.app.delete(url, handler);
  }

  // Wrap Express 'all' request handler
  public all(url: string, handler: RequestHandler): void {
    this.server.app.all(url, handler);
  }

  /**
   * Private methods for internal use
   */

  // create server config object
  private generateServerConfig() {
    this.serverConfig = {
      apiName: this.apiName,
      docsPath: this.docsPath,
      disableDocs: this.disableDocs,
      apiPath: this.apiPath,
      customTypes: this.customTypes,
      middleware: this.middleware,
      staticContentDir: this.staticContentDir,
      httpAttach: this.httpAttach,
      docsMeta: this.docsMeta
    };
  }

  // load routes from files
  private loadRoutes(): void {
    if (!this.routesDir) throw new Error(`Please specify a 'routesDir' when initialising`);
    let routes = [];
    fs.readdirSync(this.routesDir).forEach(routeFile => {
      const path = `${process.cwd()}/${this.routesDir}/${routeFile}`;
      const r = require(path);
      routes = routes.concat(r);
    });
    this.routes = routes;    
  }

  // load controllers from file
  private loadControllers(): void {
    if (!this.controllersDir) throw new Error(`Please specify a 'controllersDir' when initialising`);
    let controllers = {};
    fs.readdirSync(this.controllersDir).forEach(controllerFile => {
      if (!controllerFile.match(/\.js$/)) return;
      const path = `${process.cwd()}/${this.controllersDir}/${controllerFile}`;
      const r = require(path);
      const controllerName = controllerFile.replace('.js', '');
      controllers[controllerName] = r;
    });
    this.controllers = controllers;
  }

  // start up the HTTP server
  private startHttpServer(): void {
    this.httpServer = this.server.server;
    this.httpServer.listen(this.port);
    this.httpServer.on('error', this.onError.bind(this));
    this.httpServer.on('listening', this.onListening.bind(this));
  }

  // error handler
  private onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof this.port === 'string') ? 'Pipe ' + this.port : 'Port ' + this.port;
    switch(error.code) {
      case 'EACCES':
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  }
  
  // listening handler
  private onListening(): void {
    let addr = this.httpServer.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    aa.font(this.apiName, 'Doom', function(rendered){
      console.log(rendered);
      console.log(`Listening on ${bind}`);
    });
  }
}