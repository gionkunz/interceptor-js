function __interceptor() {
  'use strict';

  var interceptors = [];
  var apiInterceptors;

  // This function checks if a value was intercepted and will be used to determine if a value has been modified
  // by an interceptor.
  function valueIsIntercepted(value) {
    return value !== undefined;
  }

  // This function is used by Array.reduce in order to find the last element in an array that was modified by an
  // interceptor. This is important for interceptor chaining.
  function lastInterceptedValue(previous, current) {
    return valueIsIntercepted(current) ? current : previous;
  }

  // This is a very simple JSON generator that sanitizes circular references
  function flatten(s, stack) {
    if(s === undefined || s === null || (typeof s === 'number' && isNaN(s))) {
      return 'null';
    } else if(s instanceof Date) {
      return flatten(s.toJSON(), stack);
    } else if(typeof s === 'object') {
      stack = stack ? {obj: s, parent: stack} : {obj: s};

      if((function cyclic(obj, stack, found) {
        return found ||
          (stack.parent ? cyclic(obj, stack.parent, stack.parent.obj === obj) : false);
      }(s, stack))) {
        return flatten('[circular reference]');
      } else if(s instanceof Array) {
        return ['[', s.map(function(v) {
          return flatten(v, stack);
        }).join(','), ']'].join('');
      } else {
        return ['{', Object.keys(s).filter(function(key) {
          return s[key] !== undefined;
        }).map(function(key) {
          return ['"', key, '"', ':', flatten(s[key], stack)].join('');
        }).join(','), '}'].join('');
      }
    } else if (typeof s === 'string') {
      return ['"', s, '"'].join('');
    } else {
      return s;
    }
  }

  function filterObjectProperties(object, filteredKeys) {
    return filteredKeys.reduce(function(filteredObject, key) {
      if(object.hasOwnProperty(key)) {
        filteredObject[key] = object[key];
      }
      return filteredObject;
    }, {});
  }

  // Checks if all properties of A exist in B and do match
  // TODO: Check if JSON compare is the best option here
  function objectsAreEqual(a, b, filteredKeys) {
    if(filteredKeys) {
      a = filterObjectProperties(a, filteredKeys);
      b = filterObjectProperties(b, filteredKeys);
    }

    return flatten(a) === flatten(b);
  }

  function iterableToArray(iterable) {
    var arr = [];
    for(var i = 0, l = iterable.length; i < l; i++) {
      arr.push(iterable[i]);
    }
    return arr;
  }

  // Function factory to create a compound interceptor function that works with descriptor selectors
  // If an interception descriptor matches one of the added selective interceptor descriptors then
  // the interception is delegated to the compound interceptor.
  // This factory is used mainly for the API interceptor to provide the fluent API
  function selectiveCompoundInterceptorFactory() {
    var selectiveCompoundInterceptors = [];

    return {
      selectiveCompoundInterceptor: function selectiveCompoundInterceptor(descriptor) {

        return selectiveCompoundInterceptors.filter(function (selectiveInterceptor) {
          // First filter only interceptors where the descriptor matches using the isIn filter
          return objectsAreEqual(selectiveInterceptor.descriptor, descriptor, Object.keys(selectiveInterceptor.descriptor));
        }).map(function (selectiveInterceptor) {
          // After we have filtered the interceptors we execute as a compound interceptor
          // by calling each selective interceptor with the descriptor and reducing to the
          // last intercepted value
          return selectiveInterceptor.interceptor(descriptor);
        }).reduce(lastInterceptedValue, undefined);
      },
      addSelectiveInterceptor: function (descriptor, interceptor) {
        var selectiveInterceptor = {
          descriptor: descriptor,
          interceptor: interceptor
        };

        selectiveCompoundInterceptors.push(selectiveInterceptor);
        return selectiveInterceptor;
      },
      removeSelectiveInterceptor: function (selectiveInterceptor) {
        var index = selectiveCompoundInterceptors.indexOf(selectiveInterceptor);
        if (index > -1) {
          selectiveCompoundInterceptors.splice(index, 1);
        }
      }
    };
  }

  apiInterceptors = selectiveCompoundInterceptorFactory();
  // Add our apiInterceptors (selective compound interceptor) to the interceptors array as a fixed first interceptor
  interceptors.push(apiInterceptors.selectiveCompoundInterceptor);

  function createProxy(obj) {
    // This object will be the proxy that we return
    var proxy = {};
    // Define a property that links to the original object
    Object.defineProperty(proxy, '@@proxyOf', {
      enumberable: false,
      writable: false,
      value: obj
    });

    Object.keys(obj).forEach(function (key) {

      if (typeof obj[key] === 'function') {

        // Define accessor properties for function proxy
        Object.defineProperty(proxy, key, {
          enumerable: true,
          get: function () {
            return function () {
              var intercepted,
                args = iterableToArray(arguments);

              // Call every interceptor and return last one with valid return value (not undefined)
              intercepted = interceptors.map(function (interceptor) {
                return interceptor({
                  object: obj,
                  fn: key,
                  type: 'invoke',
                  args: args
                });
              }).reduce(lastInterceptedValue, undefined);

              if (valueIsIntercepted(intercepted)) {
                // Invocation should be intercepted so we return the intercepted value
                return intercepted;
              } else {
                // The invokation was not intercetped so we will invoke the original function and
                // check if the return value should be intercepted.
                var returnValue = obj[key].apply(obj, arguments);

                // Call every interceptor and return last one with valid return value (not undefined)
                intercepted = interceptors.map(function (interceptor) {
                  return interceptor({
                    object: obj,
                    fn: key,
                    type: 'return',
                    args: args,
                    value: returnValue
                  });
                }).reduce(lastInterceptedValue, undefined);

                return intercepted || returnValue;
              }
            };
          },
          set: function () {
          }
        });

      } else {

        // If the property is an object we create a proxy recursively
        var objectPropertyProxy = typeof obj[key] === 'object' ? createProxy(obj[key]) : null;

        // Define accessor properties that will call our interceptor callback
        Object.defineProperty(proxy, key, {
          enumerable: true,
          get: function () {
            var intercepted = interceptors.map(function (interceptor) {
              return interceptor({
                object: obj,
                property: key,
                type: 'get',
                value: obj[key]
              });
            }).reduce(lastInterceptedValue, undefined);

            if (valueIsIntercepted(intercepted)) {
              return intercepted;
            } else if (objectPropertyProxy) {
              return objectPropertyProxy;
            } else {
              return obj[key];
            }
          },
          set: function (value) {
            var intercepted = interceptors.map(function (interceptor) {
              return interceptor({
                object: obj,
                property: key,
                type: 'set',
                value: obj[key],
                newValue: value
              });
            }).reduce(lastInterceptedValue, undefined);

            if (valueIsIntercepted(intercepted)) {
              obj[key] = intercepted;
            } else if (typeof value === 'object') {
              obj[key] = objectPropertyProxy = createProxy(value);
            } else {
              obj[key] = value;
            }
          }
        });
      }
    });

    // As long as we can't observe new properties being added we just return a frozen proxy
    return /*Object.freeze(*/proxy/*)*/;
  }

  return {
    proxy: createProxy,
    intercept: function (fn) {
      interceptors.push(fn);
    },
    when: function (property) {
      return {
        of: function (obj) {

          // If the specified object is a proxy we'll use the original object rather than the proxy to avoid stack
          // overflow
          if (obj['@@proxyOf']) {
            obj = obj['@@proxyOf'];
          }

          // The 'then' function factory is used to add a selective interceptor to the api interceptors and
          // return an object with a remove function that can be used to remove the selective interceptor again.
          function thenFactory(descriptorSelector) {
            return function (fn) {
              var selectiveInterceptor = apiInterceptors.addSelectiveInterceptor(descriptorSelector, fn);

              return {
                remove: function remove() {
                  apiInterceptors.removeSelectiveInterceptor(selectiveInterceptor);
                }
              };
            };
          }

          if (typeof obj[property] === 'function') {
            // Return function interception API interface
            return {
              isInvoked: function () {
                return {
                  then: thenFactory({
                    object: obj,
                    type: 'invoke',
                    fn: property
                  })
                };
              },
              isInvokedWith: function () {
                return {
                  then: thenFactory({
                    object: obj,
                    type: 'invoke',
                    fn: property,
                    args: iterableToArray(arguments)
                  })
                };
              },
              returns: function () {
                return {
                  then: thenFactory({
                    object: obj,
                    type: 'return',
                    fn: property
                  })
                };
              },
              returnsWith: function (returnValue) {
                return {
                  then: thenFactory({
                    object: obj,
                    type: 'return',
                    fn: property,
                    value: returnValue
                  })
                };
              }
            };
          } else {
            // Return property accessor interception API
            return {
              isSet: function () {
                return {
                  then: thenFactory({
                    object: obj,
                    type: 'set',
                    property: property
                  })
                };
              },
              isSetTo: function (value) {
                return {
                  then: thenFactory({
                    object: obj,
                    type: 'set',
                    property: property,
                    newValue: value
                  })
                };
              },
              isAccessed: function () {
                return {
                  then: thenFactory({
                    object: obj,
                    type: 'get',
                    property: property
                  })
                };
              }
            };
          }
        }
      };
    }
  };
}