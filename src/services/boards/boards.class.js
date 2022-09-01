const { Service } = require('feathers-mongoose');
const { ObjectId } = require("mongoose").Types

exports.Boards = class Boards extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async createBoard(data, params) {
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    data.user_id = user._id
    return await super.create(data, params)
  }

  async findAllBoards(params) {
    let { skip = 0, limit = 10 } = params.query
    skip = Number(skip)
    limit = Number(limit)
    let boardProjection = {
      _id: 1,
      board_name: 1,
      board_content: 1,
      board_comment: 1,
      board_images: 1,
      liked: { $size: "$board_liked" },
      createdAt: 1,
      updatedAt: 1
    }
    if (params.headers.user_id) {
      boardProjection["isLiked"] = { $in: [params.headers.user_id, "$board_liked"] }
    }
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: boardProjection
            }
          ],
          pageInfo: [
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$pageInfo.count", 0] },
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

  async addComment(boardId) {
    return await super.Model.updateOne({ _id: ObjectId(boardId) }, { $inc: { board_comment: 1 } })
  }

  async likeBoard(id, params) {
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    let user_id = user._id.toString()
    let result = await super.Model.updateOne({ _id: ObjectId(id) }, { $addToSet: { board_liked: user_id } })
    return result
  }

  async unLikeBoard(id, params) {
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    let user_id = user._id.toString()
    let result = await super.Model.updateOne({ _id: ObjectId(id) }, { $pull: { board_liked: user_id } })
    return result
  }

  async randomBoard(id = null, params) {
    let { size = 3 } = params.query
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            {
              $match: {
                _id: { $ne: ObjectId(id) }
              },
            },
            { $sample: { size: size } },
            {
              $addFields: {
                likedCount: {
                  $size: "$board_liked"
                }
              }
            },
            {
              $project: {
                _id: 1,
                board_name: 1,
                likedCount: 1,
                board_comment: 1,
                board_images: 1,
                createdAt: 1,
              }
            }
          ],
        },
      },
      {
        $project: {
          data: 1,
        }
      }
    ])
    result = result[0]
    return result
  }

  async findBoardSortByLike(params) {
    let { size = 3 } = params.query
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            {
              $addFields: {
                likedCount: {
                  $size: "$board_liked"
                }
              }
            },
            {
              $sort: {
                likedCount: -1,
                board_comment: -1,
                createdAt: -1
              }
            },
            {
              $project: {
                _id: 1,
                board_name: 1,
                likedCount: 1,
                board_comment: 1,
                board_images: 1,
                createdAt: 1,
              }
            },
            { $limit: size }
          ],
        },
      },
      {
        $project: {
          data: 1,
        }
      }
    ])
    result = result[0]
    return result
  }

  async getBoardById(id, params) {
    let { user_id = null } = params.headers
    let result = await super.Model.aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      },
      {
        $addFields: {
          isLiked: {
            $in: [user_id, "$board_liked"]
          },
          likedCount: {
            $size: "$board_liked"
          }
        }
      },
      {
        $project: {
          _id: 1,
          board_name: 1,
          board_content: 1,
          board_comment: 1,
          board_images: 1,
          isLiked: 1,
          likedCount: 1,
          createdAt: 1,
          updatedAt: 1,
          user_id: 1
        }
      }
    ])
    result = result[0]
    return result
  }

  async getBoardByUserId(user_id, params) {
    let { skip = 0, limit = 10 } = params.query
    skip = Number(skip)
    limit = Number(limit)
    let boardProjection = {
      _id: 1,
      board_name: 1,
      board_comment: 1,
      board_images: 1,
      liked: { $size: "$board_liked" },
      createdAt: 1,
      updatedAt: 1
    }
    if (user_id) {
      boardProjection["isLiked"] = { $in: [user_id, "$board_liked"] }
    }
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
              $match: {
                user_id: user_id
              }
            },
            {
              $project: boardProjection
            }
          ],
          pageInfo: [
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$pageInfo.count", 0] },
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

  async findBoardBySearchBar(params) {
    let { skip = 0, limit = 10, searchBar } = params.query
    skip = Number(skip)
    limit = Number(limit)
    let boardProjection = {
      _id: 1,
      board_name: 1,
      board_content: 1,
      board_comment: 1,
      board_images: 1,
      liked: { $size: "$board_liked" },
      createdAt: 1,
      updatedAt: 1
    }
    if (params.headers.user_id) {
      boardProjection["isLiked"] = { $in: [params.headers.user_id, "$board_liked"] }
    }
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            {
              $match: {
                board_name: { $regex: searchBar, $options: "i" }
              }
            },
            { $sort: { createdAt: -1 } },
            { $skip: Number(skip) },
            { $limit: Number(limit) },
            {
              $project: boardProjection
            }
          ],
          pageInfo: [
            {
              $match: {
                board_name: { $regex: searchBar, $options: "i" }
              }
            },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        },
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$pageInfo.count", 0] },
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
