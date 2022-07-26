const { Service } = require('feathers-mongoose');

exports.BoardComment = class BoardComment extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async createBoardComment(data, params) {
    let { user_id } = params.decodeAccessToken
    data.user_id = user_id
    let result = await super.create(data, params)
    this.app.service("board-service").addComment(data.board_id, result._id.toString())
    return result
  }
};
