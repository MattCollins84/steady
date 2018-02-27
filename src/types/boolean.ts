import * as Joi from 'joi';

/**
 * Paramter type: boolean
 * Used for: boolean
 */

const type = {
  name: "boolean",
  description: "A boolean (true/false) value",
  validator: function(param) {
    return Joi.boolean()
  },
  example: true
}

export default type;