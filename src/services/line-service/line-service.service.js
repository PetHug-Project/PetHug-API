// Initializes the `line-service` service on path `/line-service`
const { LineService } = require('./line-service.class');
const hooks = require('./line-service.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const lineService = new LineService(options, app)
  app.use('/line-service', lineService);
  // Get our initialized service so that we can register hooks
  const service = app.service('line-service');
  service.hooks(hooks);

  app.use('/send-message', {
    async create(data, params) {
      return await lineService.sendMessage(data, params)
    }
  })
};
