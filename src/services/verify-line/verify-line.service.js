// Initializes the `verify-line` service on path `/verify-line`
const { VerifyLine } = require('./verify-line.class');
const hooks = require('./verify-line.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const verifyLineService = new VerifyLine(options, app);
  app.use('/verify-line', {
    async create(data, params) {
      return await verifyLineService.verify(data, params);
    },
    async update(id, data, params) {
      return await verifyLineService.updateRichMenu(id, data, params);
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('verify-line');

  service.hooks(hooks);
};
