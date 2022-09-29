const { Service } = require('feathers-mongoose');
const { NotificationType } = require('../../constants/NotificationType');
const NotificationStatus = {
  UNREAD: 'UNREAD',
  READ: 'READ',
}

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
          ]
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
    let { type, user, boardData } = data
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

};
