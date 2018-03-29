"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DefaultRouteHandler_1 = require("./DefaultRouteHandler");
const ErrorResponse_1 = require("./ErrorResponse");
class StreamingRouteHandler extends DefaultRouteHandler_1.DefaultRouteHandler {
    constructor(values, action, req, res) {
        super(values, action, req, res);
    }
    handle() {
        this.action(this.values, (err, emitter) => {
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
            emitter.on("data", data => {
                const output = {
                    type: "data",
                    data: data
                };
                this.res.write(JSON.stringify(output) + "\n");
            });
            emitter.on("error", err => {
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