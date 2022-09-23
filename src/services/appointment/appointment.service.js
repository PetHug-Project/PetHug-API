// Initializes the `appointment` service on path `/appointment`
const { Appointment } = require('./appointment.class');
const createModel = require('../../models/appointment.model');
const hooks = require('./appointment.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const appointmentService = new Appointment(options, app);
  app.use('/appointment-service', appointmentService);

  // Get our initialized service so that we can register hooks
  app.service('appointment-service').hooks(hooks);

};
