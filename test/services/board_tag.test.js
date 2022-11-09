const app = require('../../src/app');

describe('\'board_tag\' service', () => {
  it('registered the service', () => {
    const service = app.service('board-tag');
    expect(service).toBeTruthy();
  });
});
