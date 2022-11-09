const app = require('../../src/app');

describe('\'verify-line\' service', () => {
  it('registered the service', () => {
    const service = app.service('verify-line');
    expect(service).toBeTruthy();
  });
});
