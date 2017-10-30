"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
class Validator {
    constructor(params, values) {
        this.valid = true;
        this.params = params;
        this.values = values;
    }
    validate() {
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
                        x = x.min(param.min);
                    }
                    if (param.max && typeof param.max === 'number') {
                        x = x.max(param.max);
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
                }, []);
            }
        });
        return this.valid;
    }
    isValid() {
        return this.validate();
    }
    getErrors() {
        return this.errors;
    }
}
exports.default = Validator;
//# sourceMappingURL=Validator.js.map