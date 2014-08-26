'use strict';

describe('Intercept', function() {

  it('should be loaded into global object by UMD', function() {
    expect(window.Interceptor).not.toBeUndefined();
  });
});