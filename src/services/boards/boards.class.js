const { Service } = require('feathers-mongoose');
const { ObjectId } = require("mongoose").Types

exports.Boards = class Boards extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async createBoard(data, params) {
    let { user_id } = params.decodeAccessToken
    data.user_id = user_id
    return await super.create(data, params)
  }

  async findAllBoards(params) {
    let result = await super.Model.aggregate([
      {
        $project: {
          _id: 1,
          board_name: 1,
          board_content: 1,
          board_comment: 1,
          liked: { $size: "$board_liked" },
          createdAt: 1,
          updatedAt: 1
        }
      }
    ])
    return result
  }

  async addComment(boardId) {
    return await super.Model.updateOne({ _id: ObjectId(boardId) }, { $inc: { board_comment: 1 } })
  }

  async likeBoard(id, params) {
    let { user_id } = params.decodeAccessToken
    let result = await super.Model.updateOne({ _id: ObjectId(id) }, { $addToSet: { board_liked: user_id } })
    return result
  }
};
