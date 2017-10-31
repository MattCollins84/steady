# Steady
A simple, configurable, [Express](https://expressjs.com/) based API module to help you create new REST APIs very quickly and easily.

Features include:

* Auto-generated documentation
* Easily customisable with Express Middlewares
* Consistent approach to building APIs

## Basic usage
To gt started with Steady, you will need to do three things:

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
* Defines the action to be user from within the controller
* Defines an additional parameter `include_meta` to be used in this request


### Create application
From the root of your project:

````sh
touch app.js
````

In `app.js` we will create our new Steady API:

````javascript
const Steady = require('steady');

const app = new Steady({
  controllersDir: './controllers',
  routesDir: './routes',
  apiName: 'Example API'
});
````

Here we define the directory that our Controllers live, and the directory that our Route definitions live. We can also give our API a name. And that's it! Run the API by doing:

````sh
node app.js
````

Your API will now be running on port `5000` and you can make requests like so:

````sh
curl 'http://localhost:5000/user/123'
curl 'http://localhost:5000/user/123?include_meta=true'
````
