const app = require('../../src/app');

describe('\'pet_history\' service', () => {
  it('registered the service', () => {
    const service = app.service('pet-history');
    expect(service).toBeTruthy();
  });
});
