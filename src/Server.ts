import * as express from 'express';
import * as fileupload from 'express-fileupload';
import * as ejs from 'ejs';
import * as path from 'path';
import * as http from 'http';
import { IParamType, IHttpAttach } from './Steady';
import { Routes } from './Routes';
import ApiRouter from './ApiRouter';
import { RequestHandler, ErrorRequestHandler } from 'express';
import Validator from './Validator';
import Documentation from './Documentation';

export interface IServerOptions {
  apiName?: string
  docsPath?: string
  apiPath?: string
  customTypes?: IParamType[],
  middleware?: (RequestHandler|ErrorRequestHandler)[]
  staticContentDir?: string
  httpAttach?: IHttpAttach
}

class Server {

  // set app to be of type express.Application
  public app: express.Application;
  public server: http.Server;
  private routes: Routes;
  private controllers;
  private port: number;
  private options: IServerOptions = {
    apiName: 'API',
    docsPath: '/',
    apiPath: '/',
    customTypes: [],
    middleware: [],
    httpAttach: {}
  }

  constructor(routes, controllers, options) {
    this.app = express();
    this.server = http.createServer(this.app);
    this.routes = new Routes(routes);
    this.controllers = controllers;
    this.applyOptions(options);
    this.attachHttpComponents();
    this.config();
    this.setupRoutes();
  }

  private applyOptions(options) {
    const o = Object.assign(
      {},
      this.options,
      options
    );
    this.options = o;
  }
  
  // application config
  public config(): void {

    // handling our views for the docs
    this.app.use('/docs-assets', express.static(path.join(__dirname, '../public')));

    // static directory for other content
    if (this.options.staticContentDir) {
      this.app.use(express.static(path.join(this.options.staticContentDir)));
    }

    // express middleware
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(fileupload());

    // custom middleware
    this.options.middleware.forEach(middleware => this.app.use(middleware));
  }

  // attach http components
  public attachHttpComponents() {
    for (let attach in this.options.httpAttach) {
      this.app.set(attach, this.options.httpAttach[attach](this.server));
    }
  }

  // application routes
  public setupRoutes(): void {

    // Load API docs
    this.app.get(this.options.docsPath, (req, res) => {
      res.sendFile(path.join(__dirname, '../views', 'routes.html'));
    });

    this.app.get(`${this.options.docsPath}/types`, (req, res) => {
      res.sendFile(path.join(__dirname, '../views', 'types.html'));
    });

    this.app.get(`${this.options.docsPath}/:type`, (req, res) => {
      res.sendFile(path.join(__dirname, '../views', 'types.html'));
    });

    // load API routes from config
    const apiRouter: ApiRouter = new ApiRouter(this.routes, this.controllers, this.options.customTypes);
    this.app.use(this.options.apiPath, apiRouter.router);

    // API Docs JSON data
    this.app.get(`/documentation.json`, (req, res) => {
      const validator = new Validator([], []);
      validator.addCustomTypes(apiRouter.customTypes);

      const docs = new Documentation(this.routes.getDocsRoutes(), validator.types, this.options.apiName, this.options.apiPath);
      res.send(docs.toJSON());
    });
    
  }
}

// export
export default Server;