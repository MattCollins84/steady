import * as Joi from 'joi';

/**
 * Paramter type: number
 * Used for: numbers
 */

const type = {
  name: "number",
  description: "Any valid number",
  validator: function(param) {
    var schema = Joi.number();
    if (param.min && typeof param.min === 'number') {
      schema = schema.min(param.min)
    }
    if (param.max && typeof param.max === 'number') {
      schema = schema.max(param.max)
    }
    return schema;
  },
  example: 7,
  options: [
    {
      name: "min",
      description: "The minimum value of the number",
      example: "3"
    },
    {
      name: "max",
      description: "The maximum value of the number",
      example: "5"
    }
  ]
}

export default type;