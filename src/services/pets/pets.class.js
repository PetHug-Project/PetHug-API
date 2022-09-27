const { Service } = require('feathers-mongoose');
const dayjs = require("dayjs")
const { BadRequest } = require("@feathersjs/errors")
const qrcode = require("qrcode")
const { ObjectId } = require("mongoose").Types

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
    let qrCode = `${this.app.get('web_host')}/pet/${petDetail._id.toString()}`
    petDetail = await super.patch(petDetail._id, { qr_code_for_show: await this.generateQRCode(qrCode) })
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

  async generateQRCode(text) {
    let buffer = await qrcode.toBuffer(text, { type: 'png' })
    let obj = {
      buffer: buffer,
      originalname: `${(require("crypto").randomBytes(5)).toString('hex')}-${dayjs().unix()}.png`
    }
    let uploadService = this.app.service("upload-service")
    let { image_path } = await uploadService.resizeAndUpload(obj)
    return image_path
  }

  async createPetLost(data, params) {
    let { petId, contactName, contactNumber, petLostDetail, petLostLocation, petImages } = data
    let { uid } = params.decodeAccessToken
    let { _id: userId } = await this.app.service("users-service").getDataFromFirebaseUid(uid)
    userId = userId.toString()

    let createdAt = dayjs().toDate()
    let updatedAt = createdAt
    let result = await super.Model.updateMany({ _id: ObjectId(petId), "owner.id": userId }, { isLost: true, pet_lost_details: { contactName, contactNumber, petLostDetail, petLostLocation, petImages, createdAt, updatedAt } })
    return result
  }

  async findPetLost(params) {
    let { limit = 3, sort = "desc", skip = 0, search = "" } = params.query
    sort = sort == "desc" ? -1 : 1
    limit = Number(limit)
    skip = Number(skip)
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            { $match: { isLost: true } },
            {
              $match: {
                $or: [
                  { 'pet_breed': { $regex: search } },
                  { 'pet_lost_details.petLostDetail': { $regex: search } },
                  { 'pet_lost_details.petLostLocation': { $regex: search } }
                ]
              }
            },
            { $sort: { "pet_lost_details.updatedAt": sort } },
            { $skip: skip },
            {
              $project: {
                _id: 1,
                pet_image: 1,
                pet_name: 1,
                pet_type: 1,
                pet_health_note: 1
              }
            },
            { $limit: limit },
          ],
          pageInfo: [
            { $match: { isLost: true } },
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

};
