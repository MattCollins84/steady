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
  type: RouteParameterType
  default?: any
  values?: any[]
  regex?: string
  min?: number
  max?: number
  example?: string
  more?: IRouteParameterMore
}

interface IRouteParameterMore {
  default?: string
}

export type RouteParameterType = 'string' | 'boolean' | 'number' | 'enum';

export class Routes {
  
  public routes: IRoute[] = [];
  
  constructor(routes) {
    this.routes = routes;
    this.routes = this.routes.map((route: IRoute) => {
      route.method = route.method.toLowerCase();
      route.params.forEach((param: IRouteParameter) => {
        param.example = this.getParamExample(param);
        param.more = this.getParamMoreDetails(param);
      })
      return route;
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