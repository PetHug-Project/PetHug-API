/* eslint-disable no-unused-vars */
exports.VerifyLine = class VerifyLine {
  constructor(options, app) {
    this.options = options || {};
    this.app = app
  }

  async verify(data, params) {
    let { firebase_uid, line_uid } = data
    let user = await this.app.service('users-service').Model.findOne({ firebase_uid: firebase_uid })
    await this.app.service('users-service').Model.updateOne({ _id: user._id }, { line_uid: line_uid })
    return { _id: user._id, fname: user.fname, lname: user.lname, user_image: user.user_image, email: user.email, sign_in_provider: user.sign_in_provider }
  }

  async find(params) {
    return [];
  }

  async get(id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update(id, data, params) {
    return data;
  }

  async patch(id, data, params) {
    return data;
  }

  async remove(id, params) {
    return { id };
  }
};
