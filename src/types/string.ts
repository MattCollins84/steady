import * as Joi from 'joi';

/**
 * Paramter type: string
 * Used for: strings
 */

const type = {
  name: "string",
  description: "A string is any combination of characters",
  validator: function(param) {
    
    let schema = Joi.string();
    
    if (param.regex) {
      let regex;
      let patternMatch = param.regex.match(/^\/(.*)\/(.*)$/);
      if (!patternMatch) {
        regex = new RegExp(param.regex);
      }
      else {
        regex = new RegExp(patternMatch[1], patternMatch[2]);
      }
      
      schema = schema.regex(regex);
    }
    if (param.min) {
      schema = schema.min(param.min);
    }
    if (param.max) {
      schema = schema.max(param.max);
    }
    return schema;
  },
  example: "Hello, world!",
  options: [
    {
      name: "regex",
      description: "A regular expression that the supplied value should match",
      example: "^[A-Z]+$"
    },
    {
      name: "min",
      description: "The minimum length of the string",
      example: "3"
    },
    {
      name: "max",
      description: "The maximum length of the string",
      example: "5"
    }
  ]
}

export default type;