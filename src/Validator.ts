import * as Joi from 'joi';
import { IRouteParameter } from './Routes';
import { IParamType } from './Steady';
import { ITypesObject } from './ApiRouter';
import Types from './types';

export default class Validator {
  
  public params: IRouteParameter[];
  public values;
  public valid: boolean = true;
  public types: ITypesObject = {};
  private defaultTypes: ITypesObject = Types;
  private customTypes: ITypesObject = {};
  private errors: string[];
  
  constructor(params, values) {
    this.params = params;
    this.values = values;
    this.applyDefaults();
  }

  public addCustomTypes(types: ITypesObject) {
    this.customTypes = types;
    this.types = Object.assign(
      {},
      this.defaultTypes,
      this.customTypes
    )
  }

  public getValidTypes(): string[] {
    return Object.keys(this.types);
  }

  public isValid(): boolean {
    return this.validate();
  }

  public getErrors(): string[] {
    return this.errors;
  }

  private validate(): boolean {
    const schema = {};
    this.params.forEach(param => {

      if (this.getValidTypes().indexOf(param.type) === -1) {
        throw new Error(`Invalid parameter type '${param.type}' set for parameter: '${param.name}'`);
      }

      const type = this.types[param.type];
      let validator = type.validator(param);

      if (param.required === true) {
        validator = validator.required();
      }

      schema[param.name] = validator;
    });

    // perform the validation
    this.doValidation(this.values, schema);

    return this.valid;

  }

  private applyDefaults(): void {
    this.params.forEach(param => {

      if (typeof param.default === 'undefined') return;

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