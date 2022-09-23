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
  }

};
