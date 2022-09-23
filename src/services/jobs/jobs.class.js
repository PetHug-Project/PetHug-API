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
    let appointments = await appointmentService.findAppointment()
    if (appointments.length > 0) {
      this.sendMessageToLine(appointments)
    }
  }

  async updateTest() {
    await this.app.service('appointment-service').updateAppointmentNotification(appointmentId, SENDING)
  }

  async sendMessageToLine(appointments) {
    for (let i = 0; i < appointments.length; i++) {
      const appointment = appointments[i];
      let { name, line_uid, description, _id: appointmentId } = appointment
      appointmentId = appointmentId.toString()
      await this.app.service('line-service').sendFlexMessage(line_uid, name, description, appointmentId)
    }
  }

};
