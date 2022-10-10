/* eslint-disable no-unused-vars */
exports.Jobs = class Jobs {
  constructor(options, app) {
    this.options = options || {};
    this.app = app
  }

  async find(params) {
    return [];
  }

  async findTodoJobs() {
    const appointmentService = this.app.service('appointment-service');
    let appointments = await appointmentService.findTodoJobs()
    if (appointments.length > 0) {
      console.log("Found " + appointments.length + " Todo Jobs");
      this.sendMessageToLine(appointments)
    }
  }

  async sendMessageToLine(appointments) {
    for (let i = 0; i < appointments.length; i++) {
      const appointment = appointments[i];
      let { name, line_uid, location, _id: appointmentId, datetime } = appointment
      appointmentId = appointmentId.toString()
      await this.app.service('line-service').sendFlexMessage(line_uid, name, location, datetime, appointmentId)
    }
  }

};
