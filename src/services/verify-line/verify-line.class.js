const { default: axios } = require("axios");
/* eslint-disable no-unused-vars */
exports.VerifyLine = class VerifyLine {
  constructor(options, app) {
    this.options = options || {};
    this.app = app
    this.lineAccessToken = this.app.get('line_channel_access_token')
  }

  async verify(data, params) {
    let { firebase_uid, line_uid } = data
    let user = await this.app.service('users-service').Model.findOne({ firebase_uid: firebase_uid })
    await this.app.service('users-service').Model.updateOne({ _id: user._id }, { line_uid: line_uid })
    return { _id: user._id, fname: user.fname, lname: user.lname, user_image: user.user_image, email: user.email, sign_in_provider: user.sign_in_provider }
  }

  async updateRichMenu(id, data, params) {
    let { richMenuId, line_uid } = data
    await axios.post(`https://api.line.me/v2/bot/user/${line_uid}/richmenu/${richMenuId}`, {
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + this.lineAccessToken
      }
    })
    return { result: "SUCCESS" }
  }

};
