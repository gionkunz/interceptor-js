'use strict';

describe('Intercept', function() {

  it('should be loaded into global object by UMD', function() {
    expect(window.Interceptor).not.toBeUndefined();
  });

  it('should seal proxy objects so no new properties can be added to a proxy', function() {
    var I = window.Interceptor();
    var proxy = I.proxy({
      a: 'A',
      b: 'B',
      c: {
        d: 'D'
      },
      e: [1, 2, 3]
    });

    proxy.a = 'Modified A';
    expect(proxy.a).toBe('Modified A');

    expect(function() {
      proxy.f = 'Should not be added';
    }).toThrow();

    proxy.c.d = 'Modified D';
    expect(proxy.c.d).toBe('Modified D');

    proxy.e[0] = 'Modified array element';
    expect(proxy.e[0]).toBe('Modified array element');

    expect(function() {
      proxy.e.push('Can\'t modify arrays currently :-(');
    }).toThrow();
  });
});