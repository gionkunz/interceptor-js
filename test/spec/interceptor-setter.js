'use strict';

describe('Intercept with setter interceptions', function() {

  it('should handle first level property accessor setter interception', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a proxy of a simple object
    var proxy = Interceptor.proxy({
      a: 'Test'
    });

    // Add one interceptor that will evaluate the interception descriptor of our simple setter accessor call
    Interceptor.intercept(function(descriptor) {
      expect(descriptor).toEqual({
        object: proxy['@@proxyOf'],
        property: 'a',
        type: 'set',
        value: 'Test',
        newValue: 'New test'
      });
    });

    // Execute the setter accessor call
    proxy.a = 'New test';

    // Validate if the original object was changed too
    expect(proxy['@@proxyOf'].a).toBe('New test');
  });

  it('should handle first level property accessor setter interception with modified value', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a proxy of a simple object
    var proxy = Interceptor.proxy({
      a: 'Test'
    });

    // Add one interceptor that will evaluate the interception descriptor of our simple setter accessor call
    Interceptor.intercept(function() {
      return 'Modified test';
    });

    // Execute the setter accessor call
    proxy.a = 'New test';

    // Validate if the original object was changed with the interceptor override
    expect(proxy['@@proxyOf'].a).toBe('Modified test');
  });

  it('should handle first level property accessor setter interception with multiple interceptors (chaining)', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a proxy of a simple object
    var proxy = Interceptor.proxy({
      a: 'Test'
    });

    // Add a first interceptor that is not modifying
    Interceptor.intercept(function(descriptor) {
      expect(descriptor).toEqual({
        object: proxy['@@proxyOf'],
        property: 'a',
        type: 'set',
        value: 'Test',
        newValue: 'New test'
      });
    });

    // Add one interceptor that will modify the assigned value
    Interceptor.intercept(function() {
      return 'Modified test';
    });

    // Add an other interceptor that is also modifying
    Interceptor.intercept(function() {
      return 'Modified test 2';
    });

    // Add an other dummy interceptor
    Interceptor.intercept(function() {});

    // Execute the setter accessor call
    proxy.a = 'New test';

    // Validate the value modified by the interceptor
    expect(proxy['@@proxyOf'].a).toBe('Modified test 2');
  });

  it('should handle deep nested property accessor setter interception', function() {
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

    // Add interceptor that evaluates when a 'c' property is set and modify the value
    Interceptor.intercept(function(descriptor) {
      if(descriptor.type === 'set' && descriptor.property === 'c') {
        expect(descriptor.object).toBe(proxy['@@proxyOf'].a.b);
        expect(descriptor.newValue).toBe('New test');

        return 'Modified test';
      }
    });

    // Execute the get accessor call
    proxy.a.b.c = 'New test';

    // Validate the returned value of the accessor
    expect(proxy['@@proxyOf'].a.b.c).toBe('Modified test');

  });
});