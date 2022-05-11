const { Service } = require('feathers-mongoose');
const dayjs = require("dayjs")
const { BadRequest } = require("@feathersjs/errors")

exports.Pets = class Pets extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async get(id, params) {
    let pet = await super.get(id, params)
    let petHistory = await this.app.service("pet-history-service").Model.find({ pet_id: pet._id.toString() })
    pet.pet_history = petHistory
    return pet
  }

  async createPet(data, params) {
    let { owner_id, pet_name } = data
    let userModel = await this.app.service("users-service").getModel()
    let owner = await userModel.findOne({ _id: owner_id })
    if (!owner) {
      throw new BadRequest("User not found")
    }
    owner = owner.toObject()
    owner.id = owner._id.toString()
    delete owner._id
    await this.app.service('users-service').modelProtector(owner)
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
    let pets = await super.find({
      query: {
        "owner.id": userID,
        $select: ["pet_image", "pet_name", "pet_birthdate"]
      }
    })
    pets.data = pets.data.map(pet => {
      pet.age = this.calculateAge(pet.pet_birthdate)
      return pet
    })
    return pets
  }

  async findPetFromQrcode(params) {
    let { pet_id } = params.route
    let petDetails = await super.get({ _id: pet_id }, { query: { $select: ["pet_image", "pet_name", "pet_birthdate", "pet_gender", "pet_type", "pet_breed", "pet_color", "isLost", "pet_lost_details"] } })
    if (petDetails.isLost == true) {
      return petDetails
    }
    delete petDetails.isLost
    delete petDetails.pet_lost_details
    return petDetails
  }

  getModel() {
    return super.Model
  }

};
