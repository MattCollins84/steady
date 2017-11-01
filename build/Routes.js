"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Routes {
    constructor(routes) {
        this.routes = [];
        this.routes = routes;
        this.validateRoutes();
        this.routes = this.routes.map((route) => {
            route.method = route.method.toLowerCase();
            route.params.forEach((param) => {
                param.type = param.type.toLowerCase();
                param.example = this.getParamExample(param);
                param.more = this.getParamMoreDetails(param);
            });
            return route;
        });
    }
    validateRoutes() {
        const routeRequiredFields = ['description', 'method', 'url', 'controller', 'action'];
        const paramRequiredFields = ['name', 'required', 'type'];
        this.routes.forEach(route => {
            // make sure params is an array
            if (!route.params) {
                route.params = [];
            }
            if (!Array.isArray(route.params)) {
                throw new Error(`Params must be an array for ${route.method.toUpperCase()} ${route.url}`);
            }
            // does this route have the required properties
            const hasRequiredFields = routeRequiredFields.every(field => !!route[field]);
            if (!hasRequiredFields)
                throw new Error(`Invalid Route definition for ${route.method.toUpperCase()} ${route.url} - missing required field`);
            route.params.forEach((param, index) => {
                const hasRequiredParamFields = paramRequiredFields.every(field => typeof param[field] !== 'undefined');
                if (!hasRequiredParamFields)
                    throw new Error(`Invalid parameter definition at index ${index} for ${route.method.toUpperCase()} ${route.url} - missing required field`);
                // does enum have associated values
                if (param.type === 'enum' && (!param.values || !Array.isArray(param.values))) {
                    throw new Error(`No values defined for enum parameter in ${route.method.toUpperCase()} ${route.url}`);
                }
            });
        });
    }
    getDocsRoutes() {
        const routes = this.routes.map((route) => {
            const d = Object.assign({}, route, {
                id: `${route.method}-${route.url}`,
                name: `${route.method.toUpperCase()} ${route.url}`
            });
            return d;
        })
            .sort((a, b) => {
            if (a.id < b.id)
                return -1;
            if (a.id > b.id)
                return 1;
            return 0;
        });
        return routes;
    }
    getParamExample(param) {
        if (param.example)
            return param.example;
        let example = '';
        switch (param.type) {
            case 'string':
                example = 'foo';
                break;
            case 'boolean':
                example = true;
                break;
            case 'number':
                example = 1234;
                break;
            case 'enum':
                example = param.values.join(', ');
                break;
            case 'date':
                example = '2014-09-27';
                break;
            case 'url':
                example = 'http://www.example.com';
                break;
            case 'email':
                example = 'john@example.com';
                break;
        }
        return example;
    }
    getParamMoreDetails(param) {
        const options = ['default', 'regex', 'values', 'min', 'max'];
        const more = {};
        options.forEach((option) => {
            if (typeof param[option] !== 'undefined') {
                more[option] = param[option];
            }
        });
        return more;
    }
}
exports.Routes = Routes;
//# sourceMappingURL=Routes.js.map