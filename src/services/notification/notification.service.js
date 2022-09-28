// Initializes the `notification` service on path `/notification`
const { Notification } = require('./notification.class');
const createModel = require('../../models/notification.model');
const hooks = require('./notification.hooks');
const firebaseAuthHook = require('../../hooks/firebase-auth-hook');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const notificationService = new Notification(options, app)
  app.use('/notification-service', notificationService);

  app.use('/notification-user', {
    async find(params) {
      return notificationService.findNotificationByUserId(params)
    }
  })
  app.service('notification-user').hooks({
    before: {
      find: [firebaseAuthHook()]
    }
  });

  // Get our initialized service so that we can register hooks
  app.service('notification-service').hooks(hooks)

};
