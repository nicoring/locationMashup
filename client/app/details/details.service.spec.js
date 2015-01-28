'use strict';

describe('Service: Details', function () {

  // load the service's module
  beforeEach(module('locationMashupApp'));

  // instantiate service
  var Details;
  beforeEach(inject(function (_Details_) {
    Details = _Details_;
  }));

  it('should do something', function () {
    expect(!!Details).toBe(true);
  });

});
