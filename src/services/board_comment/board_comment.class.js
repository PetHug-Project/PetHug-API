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

  async getAllBoardCommentByBoardId(id, params) {
    let { skip = 0, limit = 10 } = params.query
    skip = Number(skip)
    limit = Number(limit)
    let result = await super.Model.aggregate([
      { $match: { board_id: id } },
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: "board_comment_replies",
                let: { "stated_comment_id": "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$board_comment_id", {
                          $toString: "$$stated_comment_id"
                        }]
                      }
                    }
                  },
                  {
                    $limit: 3
                  },
                  {
                    $project: {
                      comment_reply_id: "$_id",
                      board_comment_id: 1,
                      user_id: 1,
                      reply_comment_detail: 1,
                      createdAt: 1
                    }
                  }
                ],
                as: "reply"
              }
            },
            {
              $project: {
                _id: 1,
                board_id: 1,
                user_id: 1,
                comment_detail: 1,
                createdAt: 1,
                reply: 1
              }
            }
          ],
          pageInfo: [
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        },
      },
      {
        $project: {
          total: { $arrayElemAt: ["$pageInfo.count", 0] },
          data: 1,
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
};
