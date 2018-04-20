"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SuccessResponse {
    constructor(options) {
        this.status = 200;
        this.req = options.req;
        this.res = options.res;
        this.status = options.status || 200;
        this.data = options.data;
    }
    send() {
        this.res.status(this.status).send(this.data);
    }
}
exports.SuccessResponse = SuccessResponse;
//# sourceMappingURL=SuccessResponse.js.map