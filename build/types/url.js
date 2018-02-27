"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
/**
 * Paramter type: url
 * Used for: urls
 */
const type = {
    name: "url",
    description: "Valid URLs",
    validator: function (param) {
        return Joi.string().uri();
    },
    example: "http://www.example.com"
};
exports.default = type;
//# sourceMappingURL=url.js.map