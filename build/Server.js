"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fileupload = require("express-fileupload");
const ejs = require("ejs");
const path = require("path");
const Routes_1 = require("./Routes");
const ApiRouter_1 = require("./ApiRouter");
class Server {
    constructor(routes, controllers, options) {
        this.options = {
            apiName: 'API',
            docsPath: '/',
            apiPath: '/',
            customTypes: [],
            middleware: []
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
        // handling our views for the docs
        this.app.engine('.html', ejs.__express);
        this.app.use('/docs-assets', express.static(path.join(__dirname, '../public')));
        this.app.set('views', path.join(__dirname, '../views'));
        this.app.set('view engine', 'html');
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
        const apiRouter = new ApiRouter_1.default(this.routes, this.controllers, this.options.customTypes);
        this.app.use(this.options.apiPath, apiRouter.router);
    }
}
// export
exports.default = Server;
//# sourceMappingURL=Server.js.map