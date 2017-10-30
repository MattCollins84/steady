"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const logger = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const ejs = require("ejs");
const path = require("path");
const Routes_1 = require("./Routes");
const ApiRouter_1 = require("./ApiRouter");
class Server {
    constructor(routes, controllers, options) {
        this.options = {
            apiName: 'API',
            docsPath: '/',
            apiPath: '/'
        };
        this.app = express();
        this.routes = new Routes_1.Routes(routes);
        this.controllers = controllers;
        this.applyOptions(options);
        this.config();
        this.setupRoutes();
    }
    applyOptions(options) {
        const o = Object.assign({}, this.options, options);
        this.options = o;
    }
    // application config
    config() {
        // handling our views
        this.app.engine('.html', ejs.__express);
        this.app.use(express.static(path.join(__dirname, '../public')));
        this.app.set('views', path.join(__dirname, '../views'));
        this.app.set('view engine', 'html');
        // express middleware
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(logger('dev'));
        this.app.use(helmet());
        this.app.use(cors());
    }
    // application routes
    setupRoutes() {
        // Load API docs
        this.app.get(this.options.docsPath, (req, res) => {
            res.render('docs', {
                apiName: this.options.apiName,
                routes: this.routes.getDocsRoutes()
            });
        });
        // load API routes from config
        const apiRouter = new ApiRouter_1.default(this.routes, this.controllers);
        this.app.use(this.options.apiPath, apiRouter.router);
    }
}
// export
exports.default = Server;
//# sourceMappingURL=Server.js.map