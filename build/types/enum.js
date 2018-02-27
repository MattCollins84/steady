"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
/**
 * Paramter type: enum
 * Used for: enum
 */
const normalise = function (value) {
    // if this value is a number
    if (isNaN(parseFloat(value))) {
        return value;
    }
    return value.toString();
};
const type = {
    name: "enum",
    description: "A list of accepted values for this parameter",
    validator: function (param) {
        return Joi.string().valid(param.values.map(normalise) || []);
    },
    example: "red, green, blue",
    options: [
        {
            name: "values",
            description: "An array of accepted values",
            example: ["red", "green", "blue"],
            required: true
        }
    ]
};
exports.default = type;
//# sourceMappingURL=enum.js.map