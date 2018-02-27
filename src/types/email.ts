import * as Joi from 'joi';

/**
 * Paramter type: email
 * Used for: emails
 */

const type = {
  name: "email",
  description: "Valid email addresses",
  validator: function(param) {
    return Joi.string().email();
  },
  example: "me@example.com"
}

export default type;