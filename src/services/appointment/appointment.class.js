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
    datetime = dayjs(datetime).second(0).millisecond(0).toDate();
    delete data.datetime
    let { uid } = params.decodeAccessToken
    let user = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    if (!user.line_uid) {
      throw new Error("User not verify line")
    }
    data.line_uid = user.line_uid
    data.user_id = user._id
    data.status = PENDING
    if (!this.checkTimeValid(datetime)) {
      throw new Error("Time is not valid")
    }
    return await super.create({ datetime, ...data }, params);
  }

  async findAppointment() {
    let result = await super.Model.find({
      datetime: {
        $lt: dayjs().add(10, 'second').toDate(),
        $gt: dayjs().add(-1, 'minute').toDate(),
      },
      status: PENDING
    })
    return result
  }

  checkTimeValid(datetime) {
    if (dayjs().toDate() > datetime) {
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
