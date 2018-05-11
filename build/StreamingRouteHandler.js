"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultRouteHandler_1 = require("./DefaultRouteHandler");
const ErrorResponse_1 = require("./ErrorResponse");
class StreamingRouteHandler extends DefaultRouteHandler_1.DefaultRouteHandler {
    constructor(values, action, req, res) {
        super(values, action, req, res);
    }
    handle() {
        this.action(this.values, (err, emitter, dataMapFunction) => {
            if (err) {
                const response = new ErrorResponse_1.ErrorResponse({
                    req: this.req,
                    res: this.res,
                    errorMessage: err.errorMessage,
                    errors: err.errors,
                    status: err.status
                });
                return response.send();
            }
            // write the headers
            this.res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });
            this.req.on('close', () => {
                emitter.kill('SIGHUP');
            });
            emitter.stdout.on("data", data => {
                data = data.toString();
                if (typeof dataMapFunction === 'function') {
                    data = dataMapFunction(data);
                }
                const output = {
                    type: "data",
                    data: data
                };
                this.res.write(JSON.stringify(output) + "\n");
            });
            emitter.stderr.on("data", err => {
                err = err.toString();
                if (typeof dataMapFunction === 'function') {
                    err = dataMapFunction(err);
                }
                const output = {
                    type: "error",
                    data: err
                };
                this.res.write(JSON.stringify(output) + "\n");
            });
            emitter.on("close", data => {
                emitter.removeAllListeners();
                this.res.end();
            });
        });
    }
}
exports.StreamingRouteHandler = StreamingRouteHandler;
//# sourceMappingURL=StreamingRouteHandler.js.map