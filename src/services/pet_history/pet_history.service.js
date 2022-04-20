// Initializes the `pet_history` service on path `/pet-history`
const { PetHistory } = require('./pet_history.class');
const createModel = require('../../models/pet_history.model');
const hooks = require('./pet_history.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const petHistoryService = new PetHistory(options, app)
  app.use('/pet-history-service', petHistoryService)
  app.service('pet-history-service').hooks(hooks)

};
