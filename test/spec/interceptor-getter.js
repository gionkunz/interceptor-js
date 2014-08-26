'use strict';

describe('Intercept with getter interceptions', function() {

  it('should handle first level property accessor getter interception', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a proxy of a simple object
    var proxy = Interceptor.proxy({
      a: 'Test'
    });

    // Add one interceptor that will evaluate the interception descriptor of our simple get accessor call
    Interceptor.intercept(function(descriptor) {
      expect(descriptor).toEqual({
        object: proxy['@@proxyOf'],
        property: 'a',
        type: 'get',
        value: 'Test'
      });
    });

    // Execute the get accessor call
    var a = proxy.a;

    // Validate the returned value of the accessor
    expect(a).toBe('Test');

  });

  it('should handle first level property accessor getter interception with modified value', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a proxy of a simple object
    var proxy = Interceptor.proxy({
      a: 'Test'
    });

    // Add one interceptor that will modify the returned value
    Interceptor.intercept(function() {
      return 'Modified test';
    });

    // Execute the get accessor call
    var a = proxy.a;

    // Validate the value modified by the interceptor
    expect(a).toBe('Modified test');
  });

  it('should handle first level property accessor getter interception with multiple interceptors (chaining)', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a proxy of a simple object
    var proxy = Interceptor.proxy({
      a: 'Test'
    });

    // Add a first interceptor that is only reading and not modifying
    Interceptor.intercept(function(descriptor) {
      expect(descriptor).toEqual({
        object: proxy['@@proxyOf'],
        property: 'a',
        type: 'get',
        value: 'Test'
      });
    });

    // Add one interceptor that will modify the returned value
    Interceptor.intercept(function() {
      return 'Modified test';
    });

    // Add an other interceptor that is also modifying
    Interceptor.intercept(function() {
      return 'Modified test 2';
    });

    // Add an other dummy interceptor
    Interceptor.intercept(function() {});

    // Execute the get accessor call
    var a = proxy.a;

    // Validate the value modified by the interceptor
    expect(a).toBe('Modified test 2');
  });

  it('should handle deep nested property accessor getter interception', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a proxy of a nested object
    var proxy = Interceptor.proxy({
      a: {
        b: {
          c: 'Test'
        }
      }
    });

    // Add interceptor that evaluates when a 'c' property is accessed and return modified value
    Interceptor.intercept(function(descriptor) {
      if(descriptor.type === 'get' && descriptor.property === 'c') {
        expect(descriptor.object).toBe(proxy['@@proxyOf'].a.b);
        expect(descriptor.value).toBe('Test');

        return 'Modified test';
      }
    });

    // Execute the get accessor call
    var c = proxy.a.b.c;

    // Validate the returned value of the accessor
    expect(c).toBe('Modified test');

  });
});