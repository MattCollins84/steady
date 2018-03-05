import { ITypesObject } from './ApiRouter';
import { IServerOptions } from './Server';
import { IDocsMeta } from './Steady';

export default class Documentation {

  public routes: object;
  public types: ITypesObject;
  public name: string;
  public root: string;
  public meta: IDocsMeta;


  constructor(routes, types, options: IServerOptions) {
    this.routes = routes;
    this.types = types;
    this.name = options.apiName;
    this.root = options.apiPath;
    this.meta = options.docsMeta
  }

  toJSON() {

    // get the routes, removing controller and action function data
    // add in parameter example data if required
    // remove routes that do not require documentation
    let routes = JSON.parse(JSON.stringify(this.routes));
    routes = routes.reduce((acc, route) => {
      let privateRoute = !!route.private;
      delete route.private;
      delete route.controller;
      delete route.action;
      route.method = route.method.toUpperCase();
      route.url = `${this.root}${route.url}`.replace(/\/\//g, '/');
      const urlParams = route.url.match(/:[a-zA-Z0-9_]+/g) || [];
      urlParams.map(param => param.substr(1, param.length-1))
      .forEach(param => {
        route.params.unshift({
          name: param,
          type: "string",
          required: true,
          urlParam: true
        });
      })
      if (!privateRoute) {
        acc.push(route)
      }
      return acc;
    }, []);

    // get the types supported by the validator
    // removing validation information
    // ensure there is an options array
    let typesObject = JSON.parse(JSON.stringify(this.types));
    let types = [];
    for (var typeName in typesObject) {
      types.push(typesObject[typeName])
    }
    types = types.map(type => {
      delete type.validator;
      type.options = type.options || []
      return type;
    });

    // add parameter examples (if not supplied in the route definition)
    // and parameter options
    routes = routes.map(route => {
      if (route.params) {
        route.params.forEach(function(param) {
          param.example = param.example || getDataFromType(types, param.type, 'example');
          param.complex = getDataFromType(types, param.type, 'complex') || false;
        })
      }
      return route;
    })

    const jsonData = {
      name: this.name,
      apiRoot: this.root,
      meta: this.meta,
      routes,
      types
    }

    return jsonData;
  }

}

function getDataFromType(types, typeName, field) {
  var filteredTypes = types.filter(function(type) {
    return typeName === type.name && !!type[field];
  });
  if (filteredTypes.length === 1) return filteredTypes[0][field];
  return null;
}