/* eslint-disable no-unused-vars */
const nodemailer = require('nodemailer');

exports.Jobs = class Jobs {
  constructor(options, app) {
    this.options = options || {};
    this.app = app
    this.transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.app.get('pethug_email'),
        pass: this.app.get('pethug_app_password'),
      }
    })
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

  async sendSuggestion(data, params) {
    const { suggestionTopic, suggestionDetails } = data
    this.transport.sendMail({
      from: '"Pethug_USER"',
      to: "pethug.project@gmail.com",
      subject: `คำแนะนำจากผู้ใช้งาน ( ${suggestionTopic} )`, // หัวข้ออีเมล
      html: `<h1>คำแนะนำจากผู้ใช้งานในด้าน : ${suggestionTopic}</h1>
      <p>${suggestionDetails}</p>
      `
    })
    return { message: "Send Suggestion" }
  }

};
