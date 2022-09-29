const { Service } = require('feathers-mongoose');
const { NotificationType } = require('../../constants/NotificationType');

exports.BoardComment = class BoardComment extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async createBoardComment(data, params) {
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    data.user_id = user._id
    let result = await super.create(data, params)
    result.user = await this.app.service("users-service").getDataPublic(user._id)
    await this.app.service("board-service").addComment(data.board_id, user, NotificationType.COMMENTED)
    result.reply = []
    return result
  }

  async getAllBoardCommentByBoardId(id, params) {
    let { skip = 0, limit = 10 } = params.query
    skip = Number(skip)
    limit = Number(limit)
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $match: { board_id: id } },
            { $skip: skip },
            {
              $addFields: {
                commentId: {
                  $toString: "$_id"
                }
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
            {
              $lookup: {
                from: "board_comment_replies",
                let: { "reply_comment_id": "$commentId" },
                pipeline: [
                  {
                    $sort: {
                      createdAt: -1
                    }
                  },
                  {
                    $match: {
                      $expr: {
                        $eq: ["$board_comment_id", "$$reply_comment_id"]
                      }
                    }
                  },
                  { $limit: 1 },
                  {
                    $project: {
                      _id: 1
                    }
                  }
                ],
                as: "reply"
              }
            },
            {
              $addFields: {
                isReply: {
                  $toBool: {
                    $size: "$reply"
                  }
                }
              }
            },
            {
              $project: {
                reply: 0,
                __v: 0,
              }
            },
            {
              $addFields: {
                skip: 0
              }
            },
            { $limit: limit },
          ],
          pageInfo: [
            { $match: { board_id: id } },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        },
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
