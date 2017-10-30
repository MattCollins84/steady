"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorResponse {
    constructor(options) {
        this.req = options.req;
        this.res = options.res;
        this.status = options.status;
        this.errorMessage = options.errorMessage;
        this.errors = options.errors;
    }
    send() {
        const requestInfo = {
            request: {
                method: this.req.method,
                url: this.req.url,
                body: this.req.body || {},
                query: this.req.query || {}
            }
        };
        this.res.status(this.status).send(Object.assign({}, {
            errorMessage: this.errorMessage,
            errors: this.errors
        }, requestInfo));
    }
}
exports.ErrorResponse = ErrorResponse;
//# sourceMappingURL=ErrorResponse.js.map