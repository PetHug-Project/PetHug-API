const { Service } = require('feathers-mongoose');

exports.BoardCommentReply = class BoardCommentReply extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async createBoardCommentReply(data, params) {
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    data.user_id = user._id
    let result = await super.create(data, params)
    this.app.service("board-service").addComment(data.board_id, result._id.toString())
    return result
  }

  getModel() {
    return super.Model
  }
};
