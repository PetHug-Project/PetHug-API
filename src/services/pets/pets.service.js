// Initializes the `pets` service on path `/pets`
const { Pets } = require('./pets.class');
const createModel = require('../../models/pets.model');
const hooks = require('./pets.hooks');
const firebaseAuthHook = require('../../hooks/firebase-auth-hook');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const petService = new Pets(options, app)

  // Create Service and pass in our app and service name
  app.use('/pets-service', petService)
  app.service('pets-service').hooks(hooks)

  app.use('/pet', {
    async get(id, params) {
      return await petService.get(id, params)
    },
    async create(data, params) {
      return await petService.createPet(data, params)
    },
    async patch(id, data, params) {
      return await petService.patch(id, data, params)
    }
  })

  app.use('/pet/:pet_id/qrcode', {
    async find(params) {
      return await petService.findPetFromQrcode(params)
    }
  })

  app.use('/pet/pet-lost', {
    async create(data, params) {
      return await petService.createPetLost(data, params)
    },
  })
  app.service('pet/pet-lost').hooks({
    before: {
      create: [firebaseAuthHook()]
    }
  })

  app.use('/find-pet-lost', {
    async find(params) {
      return await petService.findPetLost(params)
    }
  })
};
