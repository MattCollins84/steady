import * as Joi from 'joi';

/**
 * Paramter type: url
 * Used for: urls
 */

const type = {
  name: "url",
  description: "Valid URLs",
  validator: function(param) {
    return Joi.string().uri();
  },
  example: "http://www.example.com"
}

export default type;