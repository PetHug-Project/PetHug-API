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
  // Get our initialized service so that we can register hooks
  app.service('notification-service').hooks(hooks)

  app.use('/notification-user', {
    async find(params) {
      return notificationService.findNotificationByUserId(params)
    },
  })
  app.service('notification-user').hooks({
    before: {
      find: [firebaseAuthHook()]
    }
  })

  app.use('/read-notification', {
    async create(data, params) {
      return notificationService.readNotification(data, params)
    },
  })
  app.service('read-notification').hooks({
    before: {
      create: [firebaseAuthHook()]
    }
  })

  app.use('/delete-notification', {
    async create(data, params) {
      return notificationService.deleteNotification(data, params)
    }
  })
  app.service('delete-notification').hooks({
    before: {
      create: [firebaseAuthHook()]
    }
  })

};
