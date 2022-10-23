const { Service } = require('feathers-mongoose');
const { NotificationStatus } = require('../../constants/Notification');

exports.Notification = class Notification extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async findNotificationByUserId(params) {
    let { uid } = params.decodeAccessToken
    let { skip = 0, limit = 10 } = params.query
    skip = Number(skip)
    limit = Number(limit)

    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    let { _id: userId } = user
    userId = userId.toString()
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            {
              $match: { user_id: userId }
            },
            {
              $match: {
                notification_status: {
                  $ne: NotificationStatus.DELETE
                }
              }
            },
            {
              $sort: {
                createdAt: -1
              }
            },
            {
              $lookup: {
                from: "users",
                let: { "userId": "$notification_from" },
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
                notification_from: { $arrayElemAt: ["$user", 0] }
              }
            },
            {
              $project: {
                __v: 0,
                user: 0,
              }
            },
            { $skip: skip },
            { $limit: limit }
          ],
          pageInfo: [
            {
              $match: { user_id: userId }
            },
            {
              $match: {
                notification_status: {
                  $ne: NotificationStatus.DELETE
                }
              }
            },
            { $group: { _id: null, count: { $sum: 1 } } },
          ]
        }
      },
      {
        $project: {
          data: 1,
          total: { $arrayElemAt: ["$pageInfo.count", 0] }
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

  async createNotification(data, params) {
    let { type, user, boardData, connectedToLine } = data
    if (connectedToLine) {
      let { _id: userId } = user
      userId = userId.toString()
      await this.create({
        user_id: userId,
        notification_status: NotificationStatus.UNREAD,
        notification_type: "LINE",
        notification_from: "SYSTEM",
      })
      return
    }
    let { user_id: ownerId } = boardData
    let { _id: userId } = user
    userId = userId.toString()
    if (ownerId === userId) {
      return
    }

    let notification = await this.create({
      user_id: ownerId,
      notification_status: NotificationStatus.UNREAD,
      notification_type: type,
      notification_from: userId,
    })
    return notification
  }

  async readNotification(data, params) {
    let { notifications } = data
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    let { _id: userId } = user
    userId = userId.toString()

    let result = await super.Model.updateMany(
      {
        _id: { $in: notifications },
        user_id: userId,
      },
      {
        $set: {
          notification_status: NotificationStatus.READ
        }
      }
    )
    return result
  }

  async deleteNotification(data, params) {
    let { notifications } = data
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    let { _id: userId } = user
    userId = userId.toString()

    let result = await super.Model.updateMany(
      {
        _id: { $in: notifications },
        user_id: userId,
      },
      {
        $set: {
          notification_status: NotificationStatus.DELETE
        }
      }
    )
    return result
  }

};
