'use strict';

describe('Interceptor API', function() {

  it('should be able to add simple accessor interceptor', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      a: 'Test'
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add one interceptor that will evaluate the interception descriptor of our simple get accessor call
    Interceptor.when('a').of(obj).isAccessed().then(function() {
      return 'Modified test';
    });

    // Execute the get accessor call
    var a = proxy.a;

    // Validate the returned value of the accessor
    expect(a).toBe('Modified test');
  });

  it('should be able to add simple accessor interceptor and remove it again', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      a: 'Test'
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add one interceptor that will evaluate the interception descriptor of our simple get accessor call
    var interceptor = Interceptor.when('a').of(obj).isAccessed().then(function() {
      return 'Modified test';
    });

    // Remove the interceptor
    interceptor.remove();

    // Execute the get accessor call
    var a = proxy.a;

    // Validate the returned value of the accessor
    expect(a).toBe('Test');
  });

  it('should provide a way to chain interceptors (via compound selective interceptor)', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      a: 'Test'
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add one interceptor that will evaluate the interception descriptor of our simple get accessor call
    Interceptor.when('a').of(obj).isAccessed().then(function() {
      return 'Modified test';
    });

    // Add a second interceptor that will take precedence
    Interceptor.when('a').of(obj).isAccessed().then(function() {
      return 'Modified test 2';
    });

    // Add third dummy interceptor
    Interceptor.when('a').of(obj).isAccessed().then(function() { });

    // Add a fourth interceptor that will take precedence
    Interceptor.when('a').of(obj).isAccessed().then(function() {
      return 'Modified test 3';
    });

    // Execute the get accessor call
    var a = proxy.a;

    // Validate the returned value of the accessor
    expect(a).toBe('Modified test 3');
  });

  it('should handle nested objects with getter accessors correctly', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      a: {
        b: {
          c: 'Test'
        }
      }
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add one interceptor that will evaluate the interception descriptor of our simple get accessor call
    Interceptor.when('c').of(obj.a.b).isAccessed().then(function() {
      return 'Modified test';
    });

    // Execute the get accessor call
    var c = proxy.a.b.c;

    // Validate the returned value of the accessor
    expect(c).toBe('Modified test');

    // Add interceptor that returns a different nested object
    Interceptor.when('a').of(obj).isAccessed().then(function() {
      return {
        b: {
          c: 'Exchanged object'
        }
      };
    });

    // Execute the get accessor call
    c = proxy.a.b.c;

    // Validate the returned value of the accessor
    expect(c).toBe('Exchanged object');
  });

  it('should handle simple setter interception that DOES NOT modify the value', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      a: 'Test'
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add one interceptor that will evaluate the interception descriptor of our simple get accessor call
    Interceptor.when('a').of(obj).isSet().then(function(descriptor) {
      expect(descriptor).toEqual({
        object: obj,
        property: 'a',
        type: 'set',
        value: 'Test',
        newValue: 'New test'
      });
    });

    // Execute the setter accessor call
    proxy.a = 'New test';

    // Validate the returned value of the accessor
    expect(obj.a).toBe('New test');
  });

  it('should handle simple setter interception that DOES modify the value', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      a: 'Test'
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add one interceptor that will evaluate the interception descriptor of our simple get accessor call
    Interceptor.when('a').of(obj).isSet().then(function() {
      return 'Modified test';
    });

    // Execute the setter accessor call
    proxy.a = 'New test';

    // Validate the returned value of the accessor
    expect(obj.a).toBe('Modified test');
  });

  it('should handle simple setter interception with a specified value selector', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      a: 'Test'
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add one interceptor that will evaluate the interception descriptor of our simple get accessor call
    Interceptor.when('a').of(obj).isSetTo('Should intercept').then(function() {
      return 'Modified test';
    });

    // Execute the setter accessor call that will not be intercepted
    proxy.a = 'Should not intercept';

    // Validate the returned value of the accessor
    expect(obj.a).toBe('Should not intercept');

    // Execute the setter accessor call that will be intercepted
    proxy.a = 'Should intercept';

    // Validate the returned value of the accessor
    expect(obj.a).toBe('Modified test');
  });

  it('should handle complex nested setter interception with a specified value selector', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      a: {
        b: {
          c: 'Test'
        }
      }
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add one interceptor that will evaluate the interception descriptor of our simple get accessor call
    Interceptor.when('c').of(proxy.a.b).isSetTo('Should intercept').then(function() {
      return 'Modified test';
    });

    // Execute the setter accessor call that will not be intercepted
    proxy.a.b.c = 'Should not intercept';

    // Validate the returned value of the accessor
    expect(obj.a.b.c).toBe('Should not intercept');

    // Execute the setter accessor call that will be intercepted
    proxy.a.b.c = 'Should intercept';

    // Validate the returned value of the accessor
    expect(obj.a.b.c).toBe('Modified test');
  });

  it('should handle simple function invocation interception without return value modification', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      abc: function(a, b, c) {
        return a + b + c;
      }
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add simple isInvoked interceptor that evaluates the descriptor
    Interceptor.when('abc').of(obj).isInvoked().then(function(descriptor) {
      expect(descriptor).toEqual({
        object: obj,
        fn: 'abc',
        type: 'invoke',
        args: [1, 2, 3]
      });
    });

    // Execute function on proxy
    var returnValue = proxy.abc(1, 2, 3);

    // Validate the returned value of the intercepted function
    expect(returnValue).toBe(6);
  });

  it('should modify return value and original function should not be called when intercepted during invocation', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      abc: function() {}
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Setup jasmine spy
    spyOn(obj, 'abc');

    // Add simple isInvoked interceptor that evaluates the descriptor
    Interceptor.when('abc').of(obj).isInvoked().then(function() {
      return 'Intercepted';
    });

    // Execute function on proxy
    var returnValue = proxy.abc();

    // Validate the returned value of the intercepted function
    expect(returnValue).toBe('Intercepted');

    // Spy on original object function should not have been triggered
    expect(obj.abc).not.toHaveBeenCalled();
  });

  it('should intercept invocation selectively based on simple argument array', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      abc: function(a, b, c) {
        return a + b + c;
      }
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add simple isInvokedWith interceptor that triggers based on arguments
    Interceptor.when('abc').of(obj).isInvokedWith(1, 2, 3).then(function() {
      return 'Intercepted';
    });

    // Execute function on proxy
    var returnValue = proxy.abc(1, 2, 3);

    // Validate the returned value of the intercepted function
    expect(returnValue).toBe('Intercepted');
  });

  it('should intercept invocation selectively based on complex argument array', function() {
    // Create a new interceptor environment
    var Interceptor = __interceptor();
    // Create a simple object
    var obj = {
      abc: function(str, num, arr, obj) {
        return str + num + arr[0] + obj.a;
      }
    };
    // Create a proxy
    var proxy = Interceptor.proxy(obj);

    // Add simple isInvokedWith interceptor that triggers based on arguments
    Interceptor.when('abc').of(obj).isInvokedWith('a', 1, ['b', 'c'], {a: 'd'}).then(function() {
      return 'Intercepted';
    });

    // Execute function on proxy
    var returnValue = proxy.abc('a', 1, ['b', 'c'], {a: 'd'});

    // Validate the returned value of the intercepted function
    expect(returnValue).toBe('Intercepted');
  });
});