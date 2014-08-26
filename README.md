# Simple interceptor library for JavaScript

I have no idea why you'd ever need interception in JavaScript but it was a nice exercise.

Some possible use cases: Testing frameworks, logging frameworks, binding frameworks or frameworks that expose objects over an API that need to be tracked / intercepted in some sort.

Do things like this:

```javascript
var I = Interceptor();

var obj = I.proxy({
  name: 'Interceptor',
  sum: function(a, b) {
    return a + b;
  },
  getProperty(object, property) {
    return object[property];
  }
});

I.when('name').of(obj).isAccessed().then(function() {
  return 'Intercepted!';
});

I.when('sum').of(obj).isInvoked().then(function() {
  return 'The whole is more than the sum of its parts';
});

I.when('getProperty').of(obj).isInvokedWith({name: 'Interceptor'}, 'name').then(function() {
  return 'Intercepted!';
});
```

## Open issues

- The practical usage of this library is not yet 100% clear
- Modifications to the original object or to the proxy don't get tracked. It currently only works with properties present when the proxy was created (maybe usage of Object.observe would help)
- invokedWith could use some wildcard arguments or something like that