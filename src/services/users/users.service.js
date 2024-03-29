// Initializes the `users` service on path `/users`
const { Users } = require('./users.class');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');
const firebaseAuthHook = require('../../hooks/firebase-auth-hook');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const userService = new Users(options, app)
  app.use('/users-service', userService)

  // Get our initialized service so that we can register hooks
  app.service('users-service')

  app.use('/auth/register/user', {
    async create(data, params) {
      return await userService.registerUser(data, params)
    }
  })

  app.use('/auth/login/user', {
    async create(data, params) {
      return await userService.loginUser(data, params)
    }
  })

  app.use("/auth/refresh", {
    async create(data, params) {
      return await userService.refreshToken(data, params)
    }
  })

  app.use('/user', {
    async get(id, params) {
      return await userService.getUser(id, params)
    },
    async patch(id, data, params) {
      return await userService.patch(id, data, params)
    }
  })
  app.service('/user').hooks(hooks)

  app.use('/user/:user_id/pets', {
    async find(params) {
      return await userService.findPetByUserId(params)
    }
  })
  app.service('/user/:user_id/pets').hooks({
    before: {
      all: [firebaseAuthHook()],
    }
  })

  app.use('/users', {
    async remove(id, params) {
      return await userService.clearAllUser();
    }
  })

  app.use('/user/data-public', {
    async get(id, params) {
      return await userService.getDataPublic(id, params)
    }
  })

  app.use('/auth/dev/users/login', {
    async create(data, params) {
      return await userService.loginWithEmail(data, params)
    }
  })

  app.use('/auth/update-role', {
    async patch(id, data, params) {
      return await userService.updateRole(id, data, params)
    }
  })
  app.service('/auth/update-role').hooks({
    before: {
      patch: [firebaseAuthHook()],
    }
  })
};
