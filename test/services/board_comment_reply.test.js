const app = require('../../src/app');

describe('\'board_comment_reply\' service', () => {
  it('registered the service', () => {
    const service = app.service('board-comment-reply');
    expect(service).toBeTruthy();
  });
});
