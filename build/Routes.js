"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Routes {
    constructor(routes) {
        this.routes = [];
        this.routes = routes;
        this.routes = this.routes.map((route) => {
            route.method = route.method.toLowerCase();
            route.params.forEach((param) => {
                param.example = this.getParamExample(param);
                param.more = this.getParamMoreDetails(param);
            });
            return route;
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