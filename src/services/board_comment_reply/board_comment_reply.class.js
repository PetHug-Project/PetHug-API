const { Service } = require('feathers-mongoose');

exports.BoardCommentReply = class BoardCommentReply extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async createBoardCommentReply(data, params) {
    let { user_id } = params.decodeAccessToken
    data.user_id = user_id
    let result = await super.create(data, params)
    this.app.service("board-service").addComment(data.board_id, result._id.toString())
    return result
  }
};
