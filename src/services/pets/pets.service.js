// Initializes the `pets` service on path `/pets`
const { Pets } = require('./pets.class');
const createModel = require('../../models/pets.model');
const hooks = require('./pets.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/pets', new Pets(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('pets');

  service.hooks(hooks);
};
