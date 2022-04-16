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
  const pets = new Pets(options, app)

  // Use for service
  app.use('/pets', pets)
  // Get our initialized service so that we can register hooks
  app.service('pets').hooks(hooks)

  app.use('/pet', {
    async get(id, params) {
      return await pets.get(id, params)
    },
    async create(data, params) {
      return await pets.createPet(data, params)
    },
    async patch(id, data, params) {
      return await pets.patch(id, data, params)
    }
  })
};
