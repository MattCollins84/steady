"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorResponse_1 = require("./ErrorResponse");
const SuccessResponse_1 = require("./SuccessResponse");
class DefaultRouteHandler {
    constructor(values, action, req, res) {
        this.values = values;
        this.action = action;
        this.req = req;
        this.res = res;
    }
    handle() {
        return this.action(this.values, (err, data) => {
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
            const response = new SuccessResponse_1.SuccessResponse({ req: this.req, res: this.res, data: data, status: 200 });
            return response.send();
        });
    }
}
exports.DefaultRouteHandler = DefaultRouteHandler;
//# sourceMappingURL=DefaultRouteHandler.js.map