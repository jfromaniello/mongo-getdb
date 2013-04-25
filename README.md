A very opinionated way to connect with the mongodb driver.

## Installation

	npm install mongo-getdb

## Why?

Because I keep doing the same thing over and over everytime I want to use mongodb from node and because this is what works for us most of the time.

## Usage

~~~javascript
var getDb = require('mongo-getdb');

getDb(function (db) {
	db.collection('products')
	  .find({})
	  .toArray(function(er, prods) {

	  });
});
~~~

You can set the url before hand as:

~~~javascript
require('mongo-getdb').init({url: 'mongodb://localhost/mydb'});

//or

require('mongo-getdb').init({url: 'mongodb://user:password@host:port/database'});
~~~

__but keep reading, you might not need this__.

## What?

-  Connection information is take from and in this order of priority: ```init``` method, ```process.env.DB```, ```process.env.MONGOLAB_URI```, any process.env starting with ```mongodb://```, any process.env starting with ```mongo://```.
-  Connection is established the first time you call getDb in any part of your application (lazy-ness).
-  There is only one connection for all the lifecycle of your application.
-  Connection is established with these options:

~~~javascript
	auto_reconnect: true,
	socketOptions: { keepAlive: 300 },
	poolSize: 10
~~~

-  When the connection can't be established it will log an error message and exit with status code 1.

## Usage with multiples databases

~~~javascript
require('mongo-getdb').init({url: {
	'db-one': 'mongodb://localhost/mydb',
	'db-two': 'mongodb://localhost/foo'
}});

getDb('db-one', function (db) {
	db.collection('products')
	  .find({})
	  .toArray(function(er, prods) {

	  });
});
~~~

Alias is optional:

~~~javascript
getDb('mongodb://localhost/mydb', function (db) {
	db.collection('products')
	  .find({})
	  .toArray(function(er, prods) {

	  });
});
~~~


## Usage with replicasets

~~~javascript
var getDb = require('mongo-getdb');

getDb.init({ url:  'mongodb://usr:password@[repl1=server1:27018,server2:27017]/mydb' });

getDb(function (db) {
	db.collection('products')
	  .find({})
	  .toArray(function(er, prods) {

	  });
});
~~~


## License

MIT - 2013 - José F. Romaniello
