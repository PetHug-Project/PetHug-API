const { Service } = require('feathers-mongoose');

exports.PetHistory = class PetHistory extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

};
