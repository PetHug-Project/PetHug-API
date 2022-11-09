const app = require('../../src/app');

describe('\'boards\' service', () => {
  it('registered the service', () => {
    const service = app.service('board-service');
    expect(service).toBeTruthy();
  });
});
