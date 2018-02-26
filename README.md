# Steady
A simple, configurable, [Express](https://expressjs.com/) based API framework to help you create new JSON based REST APIs very quickly and easily.

Features include:

* Auto-generated documentation
* Easily customisable with Express Middlewares
* Consistent approach to building APIs
* Parameter validation via [Joi](https://github.com/hapijs/joi)
* Customisable parameter types
* Basic [Typescript support](#typescript)
* Allows custom static content (HTML, etc...)
* Attach other HTTP components to the Steady server (such as Socket.IO)

## Basic usage
To install, do `npm install steady-api`

Then to get started with Steady, you will need to do three things:

* Create a controller and some actions
* Define a route
* Create a new API with this controller and route

### Create controller
In the root of your project:

````sh
mkdir controllers
touch controllers/user.js
````

In `user.js` we can create our first action:
````javascript
// connect to some kind of database
const db = new DB();

// fetch function for retrieving a user
const fetch = (params, callback) => {
  
  // attempt to retrieve the user from the DB
  db.getUser(params.userId, (err, user) => {
    
    // if there was an error (user not found)
    // then return with an error
    if (err) return callback({
      status: 404,
      errorMessage: 'This user was not found',
      errors: [
        `thingId ${params.userId} not found`
      ]
    });
    
    // optionally remove the users meta data
    if (!params.include_meta) {
      user.meta = null;
    }
    
    // return the user
    return callback(null, user);
    
  });

}

module.exports = {
  fetch: fetch
}
````

### Define a route
In the root of your project:

````sh
mkdir routes
touch routes/user.json
````

In `user.json` we describe our first route:
````json
[
  {
    "description": "Retrieve a user",
    "method": "GET",
    "url": "/user/:userId",
    "controller": "user",
    "action": "fetch",
    "params": [
      {
        "name": "include_meta",
        "required": false,
        "type": "boolean",
        "default": false
      }
    ]
  }
]
````
This route definition does the following:

* Defines an active route for `GET /user/:userId`, where `userId` can be captured as a parameter to be used later ([see Express documentation on routing for more info](https://expressjs.com/en/guide/routing.html))
* Defines the controller to be used (`user.js`)
* Defines the action to be user from within the controller (`fetch`)
* Defines an additional parameter `include_meta` that can be used in this request

**All properties except for `params` are required when defining a route**

You can create multiple definitions within each route definition file, and you can have multiple definition files within the specified `routesDir` (see below).

### Create application
From the root of your project:

````sh
touch app.js
````

In `app.js` we will create our new Steady API:

````javascript
const Steady = require('steady-api').Steady;

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  apiName: 'Example API'
});
````

Here we define the directories that our Controllers and Route Definitions live in. We can also give our API a name. And that's it! Run the API by doing:

````sh
node app.js
````

Your API will now be running on port `5000` and you can make requests like so:

````sh
curl 'http://localhost:5000/user/123'
curl 'http://localhost:5000/user/123?include_meta=true'
````

## Request & Response
One of the main drivers behind creating Steady was the desire for consistent responses, and as a result Steady is very opinionated on how it delivers these responses.

Each controller action must be defined in the following way:

````javascript
/**
 * params - contains the values passed in as parameters 
 * callback - callback function expecting two arguments:
 * > err - erroroneous response data
 * > data - successful response data
 */
const action = function(params, callback) {
  
  // do something...
  
  return callback(err, data);

}
````

### Erroneous Response
If you wish to send an error response you must provide an object with the following parameters as the `err` value in the callback:

* `status` - the HTTP status number (e.g. `400` for a Bad Request status - [more info](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes))
* `errorMessage` - A human readable error message (e.g. 'Not all required fields were provided')
* `errors` - An array of specific error messages (e.g. `['name is a required parameter', 'age must be a number']`)

The response returned to the user will look something like this:

````javascript
// HTTP/1.1 400 Bad Request
{
  "errorMessage": "This request failed validation, please check the documentation for GET /example",
  "errors": [
      "'name' with value 'David' fails to match the required pattern: /^A.{3,4}$/"
  ],
  "request": {
    "body": {
      // data passed in the body of the request
    },
    "method": "POST",
    "query": {
      // data passed in the query string of the request
    },
    "url": "/thing"
  }
}
````

### Successful Response
A successful response is much simpler, simply pass anything into the `data` argument of the callback whilst also passing `null` into the `err` argument of the callback. The response looks something like this:

````javascript
// HTTP/1.1 200 OK
{
  data: {
    // whatever gets passed into the 'data' argument
  }
}
````

Currently, all successful requests are returned with a HTTP `200` response.

## More Options
There are numerous features and options available to customise and tailor your Steady experience...

### Configuration
When creating a new instance of Steady, some configuration must be supplied in order to get up and running - however a number of sensible defaults are set in for the majority of the configuration.

A new instance of Steady is created like this: `const app = new Steady( options );`

Configuration is passed in via the `options` object, which has the following properties:

* `controllersDir` __required__ - path to a directory that contains your controllers (e.g. `./controllers`)
* `routesDir` __required__ - path to a directory that contains your route definition files (e.g. `./routes`)
* `port` _default: `5000`_ - the port your server will be listening on
* `apiName` _default: `API`_ - the name of this API. Will be referenced in the docs, etc...
* `docsPath` _default: `/`_ - the path where the API docs will be available
* `apiPath` _default: `/`_ - the path where the API routes will be served from
* `customTypes` - define custom types for use in your Route definitions, find out more in the [Custom Types](#custom-types) section of this document
* `middleware` - define the Express Middleware you wish to use, find out more in the [Middleware](#middleware) section of this document

### Route Parameters
When defining Routes in Steady, you can describe the different parameters you wish to use. Part of this process is defining what _type_ this parameter is. This helps Steady to validate that your users are passing in the correct data.

All parameter definitions can include the following information:

````javascript
{
  "name": "foo", // required - name of the parameter
  "required": true, // required - is this parameter required, true/false
  "type": "string", // required - the type of the parameter
  "default": "bar", // this will be the default value of this parameter if it is not provided by the user
  "example": "Example String" // An example of what you are expecting from the user, to be shown in the docs (sensible defaults applied if not provided)
}
````

Steady provides 8 different types out of the box:

* `string`
* `number`
* `boolean`
* `enum`
* `date`
* `url`
* `email`
* `file`

_note:_ if you wish to use the `file` parameter type you must submit your data with `multipart/form-data` encoding.

Some of these types also come with further configuration options:

#### `string`
A simple string, any amount of any characters.
You can also define a `regex` property to enforce a particular pattern

````javascript
{
  "name": "foo", 
  "required": false,
  "type": "string",
  "regex": "^[A-Z].+" // string must start with an upper case letter
}
````

#### `number`
A numeric value, integers or floats.
You can also define a `min` and/or `max` property to define a range

````javascript
{
  "name": "foo", 
  "required": false,
  "type": "number",
  "min": 10, // minimum value of 10
  "max": 100 // maximum value of 100
}
````

#### `enum`
A defined set of values.
You must define a `values` property to describe the allowed options.

````javascript
{
  "name": "foo", 
  "required": false,
  "type": "enum",
  "values": ["bar", "baz", "xyz"]
}
````

### Custom Types
Although Steady has provided you with 7 standard types out of the box, it is very possible that they won't be enough to cover the unique use cases of your applications. So to help you with this, Steady allows you to create custom types to fit these use cases.

Validation in Steady is handled by [Joi](https://github.com/hapijs/joi), and you can also use Joi to define your own parameter types along with the necessary validation to go with it.

Here is an example of creating a new `point` type, which requires an array with 2 numeric elements.

````javascript
const Steady = require('steady-api').Steady;
const Joi = require('joi');

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  customTypes: [
    {
      "name": "point", // the name of our new type
      "validation": Joi.array().length(2).items(Joi.number().required(), Joi.number().required()) // Joi validation for this type
    }
  ]
});
````

Once your new types are defined, you can use them when defining your Route parameters, just like any other type:

````javascript
{
  "name": "foo",
  "type": "point",
  "default": [1,1],
  "required": true
}
````

### Middleware
As mentioned earlier, Steady is based on [Express](https://expressjs.com/), and as such allows you to use all of your favourite Express Middleware!

For example, lets say you want to add the [Compression](https://github.com/expressjs/compression) middleware you could just do:

````javascript
const Steady = require('steady-api').Steady;
const compression = require('compression');

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  apiName: 'Example API',
  middleware: [
    compression()
  ]
});
````

### Additional routes
Again, Steady is just an Express app at heart, so if you wish to define additional routes outside of your API, you can do so!

````javascript
const Steady = require('steady-api').Steady;

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  apiName: 'Example API'
});

app.get('/example', (req, res) => {
  res.send('This is an example');
})
````

You can also use `app.post`, `app.put`, `app.delete` or `app.all` - just like in Express.

### Documentation
One of the advantages of using Steady is that documentation is auto-generated for you!

By default, the docs will be available at `/` but can be changed by specifying a `docsPath` when configuring your Steady API.

### Static Content
Steady allows you to serve out static content, simply provide the `staticContentDir` option when starting your app, pointing Steady to the location of your static content. All content is served out at `/`.

````javascript
const Steady = require('steady-api').Steady;

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  apiName: 'Example API',
  staticContentDir: './content'
});
````

### Attach other HTTP Components
If you want to attach other HTTP Components (such as [Socket.IO](http://socket.io)) to your Steady app, you can do this by defining the `httpAttach` object as shown here:

````javascript
const Steady = require('steady-api').Steady;
const io = require('socket.io')

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  apiName: 'Example API',
  httpAttach: {
    io: io
  }
});
````

_note: this experimental and only tested with Socket.IO. As long as the component you wish to use attaches to the node `http` server in the same way as Socket.IO, it should be fine_

## Typescript
Steady also has some basic [Typescript](http://typescriptlang.org) support.

Firstly, do `npm install --save-dev @types/express @types/joi`

From now onwards it's mostly the same as described above, but here's a quickstart guide:

### Creating your app
````javascript
import { ISteadyOptions, Steady } from 'steady-api';
Import * as Joi from 'joi';

// Make sure your options conforms to the required format
// including the validation for your custom types
const opts: ISteadyOptions = {
  controllersDir: './build/controllers',
  routesDir: './routes',
  customTypes: [
    {
      "name": "point",
      "validation": Joi.array().length(2).items(Joi.number().required(), Joi.number().required())
    }
  ],
}
const app = new Steady(opts);
````

### Controllers
````javascript
import { IErrorData, ISuccessData } from 'steady-api';

// enforce types for the arguments in the callback function
const getThing = (params, callback: (err: IErrorData, data?: ISuccessData) => void) => {
  
  const thing = getThing(params.thingId)

  if (!thing) {
    return callback({
      status: 404,
      errorMessage: 'This thing was not found',
      errors: [
        `thingId ${params.thingId} not found`
      ]
    })
  }

  return callback(null, thing);

}
````