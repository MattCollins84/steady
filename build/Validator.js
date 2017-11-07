"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
class Validator {
    constructor(params, values) {
        this.valid = true;
        this.types = ['string', 'number', 'boolean', 'enum', 'date', 'url', 'email', 'file'];
        this.customTypes = [];
        this.params = params;
        this.values = values;
        this.applyDefaults();
    }
    addCustomTypes(types) {
        this.customTypes = types;
    }
    getValidTypes() {
        let types = [].concat(this.types);
        const customTypes = this.customTypes.map(customType => {
            return customType.name;
        });
        types = types.concat(customTypes);
        return types;
    }
    isValid() {
        return this.validate();
    }
    getErrors() {
        return this.errors;
    }
    validateString(param) {
        let x = Joi.string();
        if (param.regex) {
            let regex = new RegExp(param.regex);
            x = x.regex(regex);
        }
        return x;
    }
    validateNumber(param) {
        let x = Joi.number();
        if (param.min && typeof param.min === 'number') {
            x = x.min(param.min);
        }
        if (param.max && typeof param.max === 'number') {
            x = x.max(param.max);
        }
        return x;
    }
    validateBoolean(param) {
        this.values[param.name] = this.values[param.name] === 'true' ? true : false;
        let x = Joi.boolean();
        return x;
    }
    validateEnum(param) {
        let x = Joi.string().valid(param.values || []);
        return x;
    }
    validateDate(param) {
        let x = Joi.date().iso();
        return x;
    }
    validateUrl(param) {
        let x = Joi.string().uri();
        return x;
    }
    validateEmail(param) {
        let x = Joi.string().email();
        return x;
    }
    validateFile(param) {
        let keys = Joi.object().keys({
            name: Joi.string(),
            mv: Joi.func(),
            data: Joi.any(),
            encoding: Joi.string(),
            mimetype: Joi.string()
        });
        let x = keys.optionalKeys('encoding', 'mimetype');
        return x;
    }
    validate() {
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
                case "file":
                    x = this.validateFile(param);
                    break;
                // custom type
                default:
                    let customType = this.customTypes.filter((customType) => {
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
    applyDefaults() {
        this.params.forEach(param => {
            if (!param.default)
                return;
            switch (param.type) {
                case "number":
                    const nan = isNaN(parseFloat(this.values[param.name]));
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
    doValidation(values, schema) {
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
exports.default = Validator;
//# sourceMappingURL=Validator.js.map