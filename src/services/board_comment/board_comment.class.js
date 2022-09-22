const { Service } = require('feathers-mongoose');

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
    this.app.service("board-service").addComment(data.board_id, result._id.toString())
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
            { $skip: skip },
            { $match: { board_id: id } },
            { $limit: limit },
            {
              $lookup: {
                from: "board_comments",
                let: { "stated_comment_id": "$_id" },
                pipeline: [
                  {
                    $addFields: {
                      commentId: {
                        $toString: "$_id"
                      }
                    }
                  },
                  {
                    $match: {
                      $expr: {
                        $eq: ["$commentId", {
                          $toString: "$$stated_comment_id"
                        }]
                      }
                    }
                  },
                  {
                    $lookup: {
                      from: "board_comment_replies",
                      let: { "reply_comment_id": "$$stated_comment_id" },
                      pipeline: [
                        {
                          $sort: {
                            createdAt: -1
                          }
                        },
                        {
                          $match: {
                            $expr: {
                              $eq: ["$board_comment_id", {
                                $toString: "$$stated_comment_id"
                              }]
                            }
                          }
                        },
                      ],
                      as: "reply"
                    }
                  }
                ],
                as: "comments"
              }
            },
            {
              $project: {
                comments: {
                  $arrayElemAt: ["$comments", 0]
                }
              }
            },
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
          data: "$data.comments",
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
