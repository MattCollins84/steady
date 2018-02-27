"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
/**
 * Paramter type: boolean
 * Used for: boolean
 */
const type = {
    name: "boolean",
    description: "A boolean (true/false) value",
    validator: function (param) {
        return Joi.boolean();
    },
    example: true
};
exports.default = type;
//# sourceMappingURL=boolean.js.map