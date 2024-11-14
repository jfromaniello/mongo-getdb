[![Build Status](https://travis-ci.org/jfromaniello/mongo-getdb.svg?branch=master)](https://travis-ci.org/jfromaniello/mongo-getdb)

An opinionated way to connect with the mongodb driver.

Versions:

| mongo-getdb      | mongodb                                      |
|------------------|----------------------------------------------|
| `mongo-getdb@^6` | `mongodb@^4` or `mongodb@^5` or `mongodb@^6` |
| `mongo-getdb@^5` | `mongodb@^4`                                 |
| `mongo-getdb@^4` | `mongodb@^3`                                 |
| `mongo-getdb@^3` | `mongodb@^2`                                 |

## Installation

	npm install mongo-getdb



## Usage

~~~javascript
var getDb = require('mongo-getdb');

getDb.init('mongo://localhost/mydb');

getDb(function (db) {
	db.collection('products')
	  .find({})
	  .toArray(function(er, prods) {

	  });
});
~~~

getDb.init allows the same parameters than [MongoClient.connect](https://github.com/mongodb/node-mongodb-native/blob/master/docs/articles/MongoClient.md#mongoclientconnect).

## Why?

Because I keep doing the same thing over and over everytime I want to use mongodb from node and because this is what works for us most of the time.

This will "memoize" the result of MongoClient.connect, so you can use getDb anywhere.

## Usage with multiples databases

~~~javascript
var getDb = require('mongo-getdb');

getDb.init('db-one', 'mongodb://localhost/mydb');
getDb.init('db-two', 'mongodb://localhost/mydb2');

getDb('db-one', function (db) {
	db.collection('products')
	  .find({})
	  .toArray(function(er, prods) {

	  });
});
~~~

## License

MIT - 2013 - José F. Romaniello
