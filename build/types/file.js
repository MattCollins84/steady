"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
/**
 * Paramter type: email
 * Used for: emails
 */
const type = {
    name: "file",
    description: "File uploads",
    validator: function (param) {
        return Joi.object().keys({
            name: Joi.string(),
            mv: Joi.func(),
            data: Joi.any(),
            encoding: Joi.string(),
            mimetype: Joi.string()
        }).optionalKeys('encoding', 'mimetype');
    },
    example: ""
};
exports.default = type;
//# sourceMappingURL=file.js.map