"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const debug = require("morgan");
const fs = require("fs");
const aa = require("ascii-art");
const Server_1 = require("./Server");
debug('API:server');
class Steady {
    constructor(options) {
        this.apiName = 'API';
        this.docsPath = '/';
        this.apiPath = '/';
        this.port = 5000;
        // required options
        this.controllersDir = options.controllersDir;
        this.routesDir = options.routesDir;
        // optional options
        this.port = options.port ? options.port : this.port;
        this.apiName = options.apiName ? options.apiName : this.apiName;
        this.docsPath = options.docsPath ? options.docsPath : this.docsPath;
        this.apiPath = options.apiPath ? options.apiPath : this.apiPath;
        // load routes and controllers and generate server configuration
        this.loadRoutes();
        this.loadControllers();
        this.generateServerConfig();
        // create new server instance
        this.server = new Server_1.default(this.routes, this.controllers, this.serverConfig);
        this.server.app.set('port', this.port);
        this.startHttpServer();
    }
    // Wrap Express middleware method
    use(middleware) {
        this.server.app.use(middleware);
    }
    // Wrap Express get request handler
    get(url, handler) {
        this.server.app.get(url, handler);
    }
    // Wrap Express post request handler
    post(url, handler) {
        this.server.app.post(url, handler);
    }
    // Wrap Express put request handler
    put(url, handler) {
        this.server.app.put(url, handler);
    }
    // Wrap Express delete request handler
    delete(url, handler) {
        this.server.app.delete(url, handler);
    }
    // Wrap Express 'all' request handler
    all(url, handler) {
        this.server.app.all(url, handler);
    }
    /**
     * Private methods for internal use
     */
    // create server config object
    generateServerConfig() {
        this.serverConfig = {
            apiName: this.apiName,
            docsPath: this.docsPath,
            apiPath: this.apiPath
        };
    }
    // load routes from files
    loadRoutes() {
        let routes = [];
        fs.readdirSync(this.routesDir).forEach(routeFile => {
            const path = `${process.cwd()}/${this.routesDir}/${routeFile}`;
            const r = require(path);
            routes = routes.concat(r);
        });
        this.routes = routes;
    }
    // load controllers from file
    loadControllers() {
        let controllers = {};
        fs.readdirSync(this.controllersDir).forEach(controllerFile => {
            const path = `${process.cwd()}/${this.controllersDir}/${controllerFile}`;
            const r = require(path);
            const controllerName = controllerFile.replace('.js', '');
            controllers[controllerName] = r;
        });
        this.controllers = controllers;
    }
    // start up the HTTP server
    startHttpServer() {
        this.httpServer = http.createServer(this.server.app);
        this.httpServer.listen(this.port);
        this.httpServer.on('error', this.onError.bind(this));
        this.httpServer.on('listening', this.onListening.bind(this));
    }
    // error handler
    onError(error) {
        if (error.syscall !== 'listen')
            throw error;
        let bind = (typeof this.port === 'string') ? 'Pipe ' + this.port : 'Port ' + this.port;
        switch (error.code) {
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
    onListening() {
        let addr = this.httpServer.address();
        let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
        aa.font(this.apiName, 'Doom', function (rendered) {
            console.log(rendered);
            debug(`Listening on ${bind}`);
            console.log(`Listening on ${bind}`);
        });
    }
}
exports.Steady = Steady;
//# sourceMappingURL=Steady.js.map