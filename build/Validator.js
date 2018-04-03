"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const types_1 = require("./types");
class Validator {
    constructor(params, values) {
        this.valid = true;
        this.types = {};
        this.defaultTypes = types_1.default;
        this.customTypes = {};
        this.params = params;
        this.values = values;
        this.applyDefaults();
    }
    addCustomTypes(types) {
        this.customTypes = types;
        this.types = Object.assign({}, this.defaultTypes, this.customTypes);
    }
    getValidTypes() {
        return Object.keys(this.types);
    }
    isValid() {
        return this.validate();
    }
    getErrors() {
        return this.errors;
    }
    validate() {
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
    applyDefaults() {
        this.params.forEach(param => {
            if (typeof param.default === 'undefined')
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