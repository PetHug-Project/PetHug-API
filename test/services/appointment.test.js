const app = require('../../src/app');

describe('\'appointment\' service', () => {
  it('registered the service', () => {
    const service = app.service('appointment');
    expect(service).toBeTruthy();
  });
});
