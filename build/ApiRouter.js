"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Validator_1 = require("./Validator");
const ErrorResponse_1 = require("./ErrorResponse");
const SuccessResponse_1 = require("./SuccessResponse");
class ApiRouter {
    constructor(routes, controllers, customTypes = []) {
        this.router = express_1.Router();
        this.routes = routes;
        this.controllers = controllers;
        this.customTypes = customTypes.reduce((customTypes, type) => {
            customTypes[type.name] = type;
            return customTypes;
        }, {});
        this.routes.routes.forEach(route => {
            switch (route.method.toLowerCase()) {
                case "get":
                case "post":
                case "put":
                case "delete":
                    this.setupRoute(route);
                    break;
                default:
                    console.error(`Invalid route method ${route.method}`);
                    break;
            }
        });
    }
    // TODO: Use correct response format
    defaultAction(req, res, callback) {
        return callback("Invalid action");
    }
    // TODO: Use correct response format
    setupRoute(route) {
        let controller = this.controllers[route.controller];
        let action = controller[route.action] || this.defaultAction;
        let authMethod = (req, res, next) => {
            return next();
        };
        if (route.authentication && route.authentication.controller && route.authentication.action) {
            authMethod = this.controllers[route.authentication.controller][route.authentication.action]();
        }
        this.router[route.method](route.url, authMethod, (req, res) => {
            let values = route.method === 'get' ? req.query : req.body;
            const validator = new Validator_1.default(route.params, Object.assign({}, values, req.files));
            validator.addCustomTypes(this.customTypes);
            try {
                if (validator.isValid() === false) {
                    const errorMessage = `This request failed validation, please check the documentation for ${route.method.toUpperCase()} ${route.url}`;
                    const err = new ErrorResponse_1.ErrorResponse({ req, res, errorMessage, errors: validator.getErrors(), status: 400 });
                    return err.send();
                }
            }
            catch (e) {
                const errorMessage = e.message;
                const errors = [
                    `Invalid route definition for ${route.method.toUpperCase()} ${route.url}`
                ];
                const err = new ErrorResponse_1.ErrorResponse({ req, res, errorMessage, errors: errors, status: 501 });
                return err.send();
            }
            values = Object.assign(validator.values, req.params);
            return action(values, (err, data) => {
                if (err) {
                    const response = new ErrorResponse_1.ErrorResponse({
                        req: req,
                        res: res,
                        errorMessage: err.errorMessage,
                        errors: err.errors,
                        status: err.status
                    });
                    return response.send();
                }
                const response = new SuccessResponse_1.SuccessResponse({ req, res, data: data, status: 200 });
                return response.send();
            });
        });
    }
}
exports.default = ApiRouter;
//# sourceMappingURL=ApiRouter.js.map