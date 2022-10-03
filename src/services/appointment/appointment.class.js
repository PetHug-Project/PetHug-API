const dayjs = require('dayjs');
const { Service } = require('feathers-mongoose');
const { PENDING } = require('../../constants/AppointmentStatus').STATUS;

exports.Appointment = class Appointment extends Service {
  constructor(options, app) {
    super(options);
    this.app = app;
  }

  async create(data, params) {
    let { datetime } = data;
    let { start_at, end_at } = datetime
    start_at = dayjs(start_at).second(0).millisecond(0).toDate();
    end_at = dayjs(end_at).second(0).millisecond(0).toDate();
    data.datetime = {
      start_at,
      end_at
    }
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    if (!user.line_uid) {
      throw new Error("User not verify line")
    }
    data.line_uid = user.line_uid
    data.user_id = user._id
    data.status = PENDING
    if (!this.checkTimeValid(start_at) && !this.checkTimeValid(end_at)) {
      throw new Error("Time is not valid")
    }
    return await super.create({ datetime, ...data }, params);
  }

  async findTodoJobs() {
    let result = await super.Model.find({
      "datetime.start_at": {
        $lte: dayjs().add(1, 'day').toDate(),
        $gte: dayjs().add(-1, 'minute').toDate(),
      },
      status: PENDING
    })
    return result
  }

  async findAppointment(params) {
    let { limit = 10, skip = 0 } = params.query
    limit = Number(limit)
    skip = Number(skip)
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    let { _id: userId } = user
    userId = userId.toString()
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            { $match: { user_id: userId } },
            { $skip: skip },
            { $limit: limit },
          ],
          pageInfo: [
            { $match: { user_id: userId } },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        }
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

  checkTimeValid(datetime) { // คือต้องเช็คว่ามากกว่า 1 วัน 5นาทีมั้ย
    if (dayjs().add(1, 'day').add(5, "min").toDate() > datetime) {
      return false
    }
    return true
  }

  async updateAppointmentNotification(appointmentId, appointmentStatus) {
    let result = await super.Model.findOneAndUpdate(
      {
        _id: appointmentId
      },
      {
        status: appointmentStatus
      })
    return result
  }

};