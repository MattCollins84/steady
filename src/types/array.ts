import * as Joi from 'joi';

/**
 * Paramter type: array
 * Used for: a collection of values
 */

const type = {
  name: "array",
  description: "An array is a collection of values, optionally enforced by a regular expression",
  validator: function (param) {
    
    let schema = Joi.array();
    
    if (param.regex) {
      let regex;
      let patternMatch = param.regex.match(/^\/(.*)\/(.*)$/);
      if (!patternMatch) {
        regex = new RegExp(param.regex);
      }
      else {
        regex = new RegExp(patternMatch[1], patternMatch[2]);
      }

      schema = schema.items(
        Joi.string().regex(regex)
      )
    }

    else if (param.numeric) {
      schema = schema.items(
        Joi.number()
      )
    }

    if(param.max){
     schema=schema.max(param.max)
    }
    if(param.min){
      schema=schema.min(param.min)
    }
    if(param.unique){
      schema=schema.unique();

    }

    return schema;
  },
  example: ["hello", "world"],
  options: [
    {
      name: "regex",
      description: "A regular expression that each of the supplied values should match",
      example: "^[A-Z]+$"
    },
    {
      name: "numeric",
      description: "Boolean. Restricts values to numbers only, if set to true",
      example: true
    },
    {
      name: "unique",
      description: "Boolean.Restricts no contains a duplicate value , if set to true",
      example: true
    }
  ]
}

export default type;
