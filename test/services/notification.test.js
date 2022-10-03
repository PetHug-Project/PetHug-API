const app = require('../../src/app');

describe('\'notification\' service', () => {
  it('registered the service', () => {
    const service = app.service('notification');
    expect(service).toBeTruthy();
  });
});
