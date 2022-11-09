// Initializes the `appointment` service on path `/appointment`
const { Appointment } = require('./appointment.class');
const createModel = require('../../models/appointment.model');
const hooks = require('./appointment.hooks');
const firebaseAuthHook = require('../../hooks/firebase-auth-hook');

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

  app.use('/create-appointment', {
    async create(data, params) {
      return await appointmentService.create(data, params);
    }
  })
  app.service('/create-appointment').hooks({
    before: {
      create: [firebaseAuthHook()]
    }
  })

  app.use('/delete-appointment', {
    async remove(id, params) {
      return await appointmentService.deleteAppointment(id, params);
    }
  })
  app.service('/delete-appointment').hooks({
    before: {
      remove: [firebaseAuthHook()]
    }
  })

  app.use('/find-appointment', {
    async find(data, params) {
      return await appointmentService.findAppointment(data, params);
    }
  })
  app.service('/find-appointment').hooks({
    before: {
      all: [firebaseAuthHook()]
    }
  })

};
