import * as Joi from 'joi';
import { IRouteParameter } from './Routes';

export default class Validator {
  
  public params: IRouteParameter[];
  public values;
  public valid: boolean = true;
  private errors: string[];
  
  constructor(params, values) {
    this.params = params;
    this.values = values;
  }

  private validate(): boolean {
    const schema = {};
    this.params.forEach(param => {
      
      let x = null;

      // types
      switch (param.type) {

        case "string":
          x = Joi.string();
          if (param.regex) {
            let regex = new RegExp(param.regex);
            x = x.regex(regex);
          }
          break;

        case "number":
          x = Joi.number();
          if (param.min && typeof param.min === 'number') {
            x = x.min(param.min)
          }
          if (param.max && typeof param.max === 'number') {
            x = x.max(param.max)
          }
          break;

        case "boolean":
          this.values[param.name] = this.values[param.name] === 'true' ? true : false;
          x = Joi.boolean();
          break;

        case "enum":
          x = Joi.string().valid(param.values || []);
          break;

      }

      // required
      if (param.required === true) {
        x = x.required();
      }

      schema[param.name] = x;

      // apply defaults
      if (!this.values[param.name] && this.values[param.name] !== 0 && param.default) {
        this.values[param.name] = param.default;
      }

    });

    // do the validation
    const result = Joi.validate(this.values, schema, { abortEarly: false }, (err, value) => {
      if (err) {
        this.valid = false;
        this.errors = err.details.reduce((acc, detail) => {
          acc.push(detail.message.replace(/\"/g, "'"));
          return acc;
        }, [])
      }
    });

    return this.valid;

  }

  public isValid(): boolean {
    return this.validate();
  }

  public getErrors(): string[] {
    return this.errors;
  }
}