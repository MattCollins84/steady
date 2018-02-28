"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const fileupload = require("express-fileupload");
const path = require("path");
const http = require("http");
const Routes_1 = require("./Routes");
const ApiRouter_1 = require("./ApiRouter");
const Validator_1 = require("./Validator");
const Documentation_1 = require("./Documentation");
class Server {
    constructor(routes, controllers, options) {
        this.options = {
            apiName: 'API',
            docsPath: '/',
            disableDocs: false,
            apiPath: '/',
            customTypes: [],
            middleware: [],
            httpAttach: {}
        };
        this.app = express();
        this.server = http.createServer(this.app);
        this.routes = new Routes_1.Routes(routes);
        this.controllers = controllers;
        this.applyOptions(options);
        this.attachHttpComponents();
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
    attachHttpComponents() {
        for (let attach in this.options.httpAttach) {
            this.app.set(attach, this.options.httpAttach[attach](this.server));
        }
    }
    // application routes
    setupRoutes() {
        // Load API docs
        if (this.options.disableDocs === false) {
            this.app.get(this.options.docsPath, (req, res) => {
                res.sendFile(path.join(__dirname, '../views', 'routes.html'));
            });
            this.app.get(`${this.options.docsPath}/types`, (req, res) => {
                res.sendFile(path.join(__dirname, '../views', 'types.html'));
            });
            this.app.get(`${this.options.docsPath}/:type`, (req, res) => {
                res.sendFile(path.join(__dirname, '../views', 'types.html'));
            });
        }
        // load API routes from config
        const apiRouter = new ApiRouter_1.default(this.routes, this.controllers, this.options.customTypes);
        this.app.use(this.options.apiPath, apiRouter.router);
        // API Docs JSON data
        this.app.get(`/documentation.json`, (req, res) => {
            const validator = new Validator_1.default([], []);
            validator.addCustomTypes(apiRouter.customTypes);
            const docs = new Documentation_1.default(this.routes.getDocsRoutes(), validator.types, this.options.apiName, this.options.apiPath);
            res.send(docs.toJSON());
        });
    }
}
// export
exports.default = Server;
//# sourceMappingURL=Server.js.map