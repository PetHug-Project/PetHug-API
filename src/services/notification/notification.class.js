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
            { $skip: skip },
            { $limit: limit }
          ],
          pageInfo: [
            {
              $match: { user_id: userId }
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
    let { type, user, boardData } = data
    switch (type) {
      case NotificationType.LIKED:
        return this.createLikedNotification(boardData, user)
      case NotificationType.COMMENTED:
        return this.createCommentedNotification(boardData, user)
      case NotificationType.REPLY:
        return this.createReplyNotification(boardData, user)
      default:
        break;
    }
    // let notification = await this.create(data)
    // return notification
  }

  async createLikedNotification(boardData, user) {
    const notificationMessage = 'ได้กดถูกใจบอร์ดของคุณ'
    let { user_id: ownerId } = boardData
    let { _id: userId, fname: userFname } = user
    userId = userId.toString()
    if (ownerId === userId) {
      return
    }

    let notification = await this.create({
      user_id: ownerId,
      message: notificationMessage,
      notificationStatus: NotificationStatus.UNREAD,
      notificationType: NotificationType.LIKED,
      notificationFrom: userFname,
    })

    return notification
  }

  async createCommentedNotification(boardData, user) {
    const notificationMessage = 'ได้แสดงความคิดเห็นบอร์ดของคุณ'
    let { user_id: ownerId } = boardData
    let { _id: userId, fname: userFname } = user
    userId = userId.toString()
    if (ownerId === userId) {
      return
    }

    let notification = await this.create({
      user_id: ownerId,
      message: notificationMessage,
      notificationStatus: NotificationStatus.UNREAD,
      notificationType: NotificationType.COMMENTED,
      notificationFrom: userFname,
    })

    return notification
  }

  async createReplyNotification(boardData, user) {
    const notificationMessage = 'ได้ตอบความคิดเห็นบอร์ดของคุณ'
    let { user_id: ownerId } = boardData
    let { _id: userId, fname: userFname } = user
    userId = userId.toString()
    if (ownerId === userId) {
      return
    }

    let notification = await this.create({
      user_id: ownerId,
      message: notificationMessage,
      notificationStatus: NotificationStatus.UNREAD,
      notificationType: NotificationType.REPLY,
      notificationFrom: userFname,
    })
    return notification
  }
};
