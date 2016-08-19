Easen DI
========

[![Travis](https://travis-ci.org/rangoo94/easen-di.svg)](https://travis-ci.org/rangoo94/easen-di)
[![Code Climate](https://codeclimate.com/github/rangoo94/easen-di/badges/gpa.svg)](https://codeclimate.com/github/rangoo94/easen-di)
[![Coverage Status](https://coveralls.io/repos/github/rangoo94/easen-di/badge.svg?branch=master)](https://coveralls.io/github/rangoo94/easen-di?branch=master)

It's a dependency injection container which requires ES6 (because of [Proxy](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Proxy) as safe way to provide services).
It handles properly circular dependencies.

How to use
----------

Firstly just create container:

```
const Di = require('easen-di')
let container = new Di()
```

There are two main methods to register services:

- `register` to register dependency directly
```
container.register('environment', 'production')
container.register('SomeClass', SomeClass)
container.register('pow', x => x * x)
```
- `factory` to create factory (it allows using other dependencies as well)
```
container.factory('environment', () => 'production')
container.factory('logger', ({ environment }) => {
  return environment === 'production' ? new JsonLogger() : new DevLogger()
})
```

Now, you can get dependency directly by `get` method:

```
container.get('logger') // JsonLogger
```

Or you can use safe getter:

```
container.getter.logger // JsonLogger
```

Getter is preferred for external services, as it can't be mutated and can be just treat as normal object in other services;
It makes very simple to test functions as they are not dependent on DI container:

```
const container = new Di()
container.register('environment', 'production')

function createLogMethod({ environment }) {
   if (environment !== 'production') {
     return (...args) => console.log(...args)
   } else {
     return () => {}
   }
}

// Without DI
const log = createLogMethod({ environment: 'production' })
log('something')

// With DI
const log = createLogMethod(container.getter)
log('something')

// As a DI service
container.factory('log', createLogMethod)
container.getter.log('something')
```

Development
-----------

[Mocha](http://mochajs.org) with [Expect.js](https://github.com/Automattic/expect.js) are used for tests, with [Wallaby](http://wallabyjs.com) as additional runner for development.
Code style standard is a little modified [StandardJS](http://standardjs.com).
