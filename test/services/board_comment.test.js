const app = require('../../src/app');

describe('\'board_comment\' service', () => {
  it('registered the service', () => {
    const service = app.service('board-comment');
    expect(service).toBeTruthy();
  });
});
