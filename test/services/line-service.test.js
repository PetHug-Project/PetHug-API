const app = require('../../src/app');

describe('\'line-service\' service', () => {
  it('registered the service', () => {
    const service = app.service('line-service');
    expect(service).toBeTruthy();
  });
});
