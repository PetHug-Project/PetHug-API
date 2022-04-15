// Initializes the `users` service on path `/users`
const { Users } = require('./users.class');
const createModel = require('../../models/users.model');
const hooks = require('./users.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const users = new Users(options, app)
  app.use('/users', users)

  // Get our initialized service so that we can register hooks
  app.service('users')

  app.use('/auth/register/user', {
    async create(data, params) {
      return await users.registerUser(data, params)
    }
  })

  app.use('/auth/login/user', {
    async create(data, params) {
      return await users.loginUser(data, params)
    }
  })

  app.use("/auth/refresh", {
    async create(data, params) {
      return await users.refreshToken(data, params)
    }
  })

  app.use('/user', {
    async get(id, params) {
      return await users.getUser(id, params)
    }
  })
  app.service('/user').hooks(hooks)
};
