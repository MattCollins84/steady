import * as Joi from 'joi';

/**
 * Paramter type: date
 * Used for: dates and times
 */

const type = {
  name: "date",
  description: "Dates and times in a ISO 8601 format",
  validator: function(param) {
    return Joi.date().iso();
  },
  example: "2018-01-10, 2018-01-10T11:30:19+00:00"
}

export default type;