import * as express from 'express';
import * as fileupload from 'express-fileupload';
import * as ejs from 'ejs';
import * as path from 'path';
import { ICustomType } from './Steady';
import { Routes } from './Routes';
import ApiRouter from './ApiRouter';
import { RequestHandler, ErrorRequestHandler } from 'express';

export interface IServerOptions {
  apiName?: string
  docsPath?: string
  apiPath?: string
  customTypes?: ICustomType[],
  middleware?: (RequestHandler|ErrorRequestHandler)[]
}

class Server {

  // set app to be of type express.Application
  public app: express.Application;
  private routes: Routes;
  private controllers;
  private port: number;
  private options: IServerOptions = {
    apiName: 'API',
    docsPath: '/',
    apiPath: '/',
    customTypes: [],
    middleware: []
  }

  constructor(routes, controllers, options) {
    this.app = express();
    this.routes = new Routes(routes);
    this.controllers = controllers;
    this.applyOptions(options);
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

    // handling our views
    this.app.engine('.html', ejs.__express);
    this.app.use(express.static(path.join(__dirname, '../public')));
    this.app.set('views', path.join(__dirname, '../views'));
    this.app.set('view engine', 'html');

    // express middleware
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(fileupload());

    // custom middleware
    this.options.middleware.forEach(middleware => this.app.use(middleware));
  }

  // application routes
  public setupRoutes(): void {

    // Load API docs
    this.app.get(this.options.docsPath, (req, res) => {
      res.render('docs', {
        apiName: this.options.apiName,
        routes: this.routes.getDocsRoutes()
      });
    });

    // load API routes from config
    const apiRouter: ApiRouter = new ApiRouter(this.routes, this.controllers, this.options.customTypes);
    this.app.use(this.options.apiPath, apiRouter.router);
    
  }
}

// export
export default Server;