const { Service } = require('feathers-mongoose');
const dayjs = require("dayjs")
const { BadRequest } = require("@feathersjs/errors")
const ObjectId = require("mongoose").Types.ObjectId

exports.Pets = class Pets extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async createPet(data, params) {
    let { owner_id, pet_name } = data
    let userModel = await this.app.service("users").getModel()
    let owner = await userModel.findOne({ _id: owner_id })
    if (!owner) {
      throw new BadRequest("User not found")
    }
    owner = owner.toObject()
    owner.id = owner._id.toString()
    delete owner._id
    await this.app.service('users').modelProtector(owner)
    delete owner.pets
    let foundPet = await super.find({ query: { pet_name: pet_name, "owner.id": owner_id } })
    if (foundPet.total > 0) {
      throw new BadRequest("Pet already exists")
    }
    let petDetail = await super.create({ ...data, owner: owner })
    await userModel.updateOne({ _id: owner_id }, { $push: { pets: petDetail._id.toString() } })
    return petDetail
  }

  calculateAge(birthdate) {
    const now = dayjs()
    const birthdateDayjs = dayjs(birthdate)
    const age = {
      years: now.diff(birthdateDayjs, 'year'),
      months: now.diff(birthdateDayjs, 'month') - (now.diff(birthdateDayjs, 'year') * 12),
    }
    return age
  }

  async findPetByUserId(userID) {
    let pets = await super.find({ owner_id: userID, query: { $select: ["pet_image", "pet_name", "pet_birthdate"] } })
    pets.data = pets.data.map(pet => {
      pet.age = this.calculateAge(pet.pet_birthdate)
      return pet
    })
    return pets
  }

};
