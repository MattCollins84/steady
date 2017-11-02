export interface IRoute {
  description: string
  method: string
  url: string
  controller: string
  action: string
  params: IRouteParameter[]
}

export interface IDocsRoute extends IRoute {
  id: string
  name: string
}

export interface IRouteParameter {
  name: string
  required: boolean
  type: string
  default?: any
  values?: any[]
  regex?: string
  min?: number
  max?: number
  example?: string
  more?: IRouteParameterMore
}

export interface IRouteParameterMore {
  default?: string
  regex?: string
  values?: any[]
  min?: number
  max?: number
}

export class Routes {
  
  public routes: IRoute[] = [];
  
  constructor(routes) {
    this.routes = routes;
    this.validateRoutes();
    this.routes = this.routes.map((route: IRoute) => {
      route.method = route.method.toLowerCase();
      route.params.forEach((param: IRouteParameter) => {
        param.type = param.type.toLowerCase();
        param.example = this.getParamExample(param);
        param.more = this.getParamMoreDetails(param);
      })
      return route;
    });
  }

  validateRoutes() {
    const routeRequiredFields = ['description', 'method', 'url', 'controller', 'action'];
    const paramRequiredFields = ['name', 'required', 'type']
    this.routes.forEach(route => {
      
      // make sure params is an array
      if (!route.params) { 
        route.params = [];
      }
      if (!Array.isArray(route.params)) {
        throw new Error(`Params must be an array for ${route.method.toUpperCase()} ${route.url}`)
      }

      // does this route have the required properties
      const hasRequiredFields = routeRequiredFields.every(field => !!route[field])
      if (!hasRequiredFields) throw new Error(`Invalid Route definition for ${route.method.toUpperCase()} ${route.url} - missing required field`)

      route.params.forEach((param, index) => {
        const hasRequiredParamFields = paramRequiredFields.every(field => typeof param[field] !== 'undefined');
        if (!hasRequiredParamFields) throw new Error(`Invalid parameter definition at index ${index} for ${route.method.toUpperCase()} ${route.url} - missing required field`);

        // does enum have associated values
        if (param.type === 'enum' && (!param.values || !Array.isArray(param.values))) {
          throw new Error(`No values defined for enum parameter in ${route.method.toUpperCase()} ${route.url}`)
        }
      })

    });
  }

  getDocsRoutes(): IDocsRoute[] {
    const routes = this.routes.map((route: IRoute) => {
      const d = Object.assign(
        {},
        route,
        {
          id: `${route.method}-${route.url}`,
          name: `${route.method.toUpperCase()} ${route.url}`
        }
      );
      return d;
    })
    .sort((a: IDocsRoute, b: IDocsRoute) => {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0;
    });

    return routes;
  }

  getParamExample(param: IRouteParameter): string {
    if (param.example) return param.example;
    let example: any = '';
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
        example = param.values.join(', ')
        break;

      case 'date':
        example = '2014-09-27'
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

  getParamMoreDetails(param: IRouteParameter): IRouteParameterMore {
    const options: string[] = ['default', 'regex', 'values', 'min', 'max'];
    const more: IRouteParameterMore = {};
    options.forEach((option: string) => {
      if (typeof param[option] !== 'undefined') {
        more[option] = param[option]
      }
    })
    
    return more;
  }

}