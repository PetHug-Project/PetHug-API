const { Service } = require('feathers-mongoose');
const dayjs = require("dayjs")

exports.Pets = class Pets extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async createPet(data, params) {
    let { owner_id } = data
    let userModel = await this.app.service("users").getModel()
    let owner = await userModel.findOne({ _id: owner_id })
    owner = owner.toObject()
    await this.app.service('users').modelProtector(owner)
    delete owner.pets
    let petDetail = await super.create({ ...data, owner: owner })
    await userModel.updateOne({ _id: owner_id }, { $push: { pets: petDetail._id } })
    return petDetail
  }

  async calculateAge(birthdate) {
    const now = dayjs()
    const birthdateDayjs = dayjs(birthdate)
    const age = {
      years: now.diff(birthdateDayjs, 'year'),
      months: now.diff(birthdateDayjs, 'month') - (now.diff(birthdateDayjs, 'year') * 12),
    }
    return age
  }

};
