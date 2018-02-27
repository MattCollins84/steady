"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
/**
 * Paramter type: email
 * Used for: emails
 */
const type = {
    name: "email",
    description: "Valid email addresses",
    validator: function (param) {
        return Joi.string().email();
    },
    example: "me@example.com"
};
exports.default = type;
//# sourceMappingURL=email.js.map