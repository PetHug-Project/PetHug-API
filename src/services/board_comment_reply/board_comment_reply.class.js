const { Service } = require('feathers-mongoose');
const { NotificationType } = require('../../constants/Notification');

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
    result.user = await this.app.service("users-service").getDataPublic(user._id)
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
            {
              $lookup: {
                from: "users",
                let: { "userId": "$user_id" },
                pipeline: [
                  {
                    $addFields: {
                      userId: {
                        $toString: "$_id"
                      }
                    }
                  },
                  {
                    $match: {
                      $expr: {
                        $eq: ["$userId", "$$userId"]
                      }
                    }
                  },
                  {
                    $project: {
                      user_image: 1,
                      fname: 1,
                      lname: 1,
                    }
                  }
                ],
                as: "user"
              }
            },
            {
              $addFields: {
                user: { $arrayElemAt: ["$user", 0] }
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
