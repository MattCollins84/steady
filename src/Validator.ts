import * as Joi from 'joi';
import { IRouteParameter } from './Routes';
import { ICustomType } from './Steady';

export default class Validator {
  
  public params: IRouteParameter[];
  public values;
  public valid: boolean = true;
  private types: string[] = ['string', 'number', 'boolean', 'enum', 'date', 'url', 'email'];
  private customTypes: ICustomType[] = [];
  private errors: string[];
  
  constructor(params, values) {
    this.params = params;
    this.values = values;
    this.applyDefaults();
  }

  public addCustomTypes(types: ICustomType[]) {
    this.customTypes = types;
  }

  public getValidTypes(): string[] {
    let types = [].concat(this.types);
    const customTypes: string[] = this.customTypes.map(customType => {
      return customType.name;
    });
    types = types.concat(customTypes);
    return types;
  }

  public isValid(): boolean {
    return this.validate();
  }

  public getErrors(): string[] {
    return this.errors;
  }

  private validateString(param) {
    let x = Joi.string();
    if (param.regex) {
      let regex = new RegExp(param.regex);
      x = x.regex(regex);
    }
    return x;
  }

  private validateNumber(param) {
    let x = Joi.number();
    if (param.min && typeof param.min === 'number') {
      x = x.min(param.min)
    }
    if (param.max && typeof param.max === 'number') {
      x = x.max(param.max)
    }
    return x;
  }

  private validateBoolean(param: IRouteParameter) {
    this.values[param.name] = this.values[param.name] === 'true' ? true : false;
    let x = Joi.boolean();
    return x;
  }

  private validateEnum(param: IRouteParameter) {
    let x = Joi.string().valid(param.values || []);
    return x;
  }

  private validateDate(param: IRouteParameter) {
    let x = Joi.date().iso();
    return x;
  }

  private validateUrl(param: IRouteParameter) {
    let x = Joi.string().uri();
    return x;
  }

  private validateEmail(param: IRouteParameter) {
    let x = Joi.string().email();
    return x;
  }

  private validate(): boolean {
    const schema = {};
    this.params.forEach(param => {

      if (this.getValidTypes().indexOf(param.type) === -1) {
        throw new Error(`Invalid parameter type '${param.type}' set for parameter: '${param.name}'`);
      }

      let x = null;
      switch (param.type) {
        case "string":
          x = this.validateString(param);
          break;
        case "number":
          x = this.validateNumber(param);
          break;
        case "boolean":
          x = this.validateBoolean(param);
          break;
        case "enum":
          x = this.validateEnum(param);
          break;
        case "date":
          x = this.validateDate(param);
          break;
        case "url":
          x = this.validateUrl(param);
          break;
        case "email":
          x = this.validateEmail(param);
          break;
        // must be a custom type
        default:
          let customType: ICustomType = this.customTypes.filter((customType: ICustomType) => {
            return customType.name === param.type;
          })[0];
          x = customType.validation;
          break;
      }

      if (param.required === true) {
        x = x.required();
      }

      schema[param.name] = x;
    });

    // perform the validation
    this.doValidation(this.values, schema);

    return this.valid;

  }

  private applyDefaults(): void {
    this.params.forEach(param => {
      
      if (!param.default) return;

      switch(param.type) {
        case "number":
          const nan = isNaN(parseFloat(this.values[param.name]))
          const defaultIsNumber = (param.default && !isNaN(parseFloat(param.default)));
          if (nan && defaultIsNumber) {
            this.values[param.name] = parseFloat(param.default);
          } 
          break;

        default:
          if (!this.values[param.name]) {
            this.values[param.name] = param.default;
          }
          break;
      }
      
      if (!this.values[param.name] && this.values[param.name] !== 0 && param.default) {
        this.values[param.name] = param.default;
      }
    });
  }

  private doValidation(values, schema) {
    return Joi.validate(values, schema, { abortEarly: false, convert: true }, (err, value) => {
      if (err) {
        this.valid = false;
        this.errors = err.details.reduce((acc, detail) => {
          acc.push(detail.message.replace(/\"/g, "'"));
          return acc;
        }, []);
        return;
      }
      this.values = value;
    });
  }
}