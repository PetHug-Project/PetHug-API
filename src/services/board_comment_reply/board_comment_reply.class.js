const { Service } = require('feathers-mongoose');
const { NotificationType } = require('../../constants/NotificationType');

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
    this.app.service("board-service").addComment(data.board_id, user, NotificationType.REPLY)
    return result
  }

  async getMoreCommentReplyWithBoardCommentId(boardCommentId, params) {
    let { skip = 0, limit = 3, board_id: boardId } = params.query
    skip = Number(skip)
    limit = Number(limit)
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $project: { __v: 0 } },
            {
              $match: {
                board_comment_id: boardCommentId,
                board_id: boardId
              }
            },
            { $skip: skip },
            { $limit: limit },
          ],
          pageInfo: [
            {
              $match: {
                board_comment_id: boardCommentId,
                board_id: boardId
              }
            },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        }
      },
      {
        $project: {
          total: { $arrayElemAt: ["$pageInfo.count", 0] },
          data: "$data",
        }
      }
    ])
    result = result[0]
    result.skip = skip
    result.limit = limit
    result.totalPage = Math.ceil(result.total / limit)
    result.currentPage = Math.ceil(skip / limit) + 1
    return result
  }

  getModel() {
    return super.Model
  }
};
