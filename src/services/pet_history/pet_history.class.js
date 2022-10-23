const { BadRequest } = require('@feathersjs/errors');
const { Service } = require('feathers-mongoose');
const { ObjectId } = require("mongoose").Types
exports.PetHistory = class PetHistory extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async addPetHistory(data, params) {
    const { pet_id } = params.query
    let pet = await this.app.service("pets-service").get(pet_id, params)
    if (!pet) {
      throw new BadRequest("Pet not found")
    }
    if (!pet.isOwner || !data.veterinary) {
      throw new BadRequest("You are not owner of this pet")
    }
    let result = await super.create(data, params)
    const petModel = this.app.service('pets-service').getModel()
    await petModel.updateOne({ _id: pet_id }, { $push: { pet_history: result._id.toString() } })
    return result
  }

  async getPetHistory(params) {
    const { pet_id } = params.query
    let result = await super.find({ query: { pet_id: pet_id } })
    return result
  }

  async editPetHistory(id, data, params) {
    let pet = await this.app.service("pets-service").get(id, params)
    if (!pet) {
      throw new BadRequest("Pet not found")
    }
    if (!pet.isOwner || !data.veterinary) {
      throw new BadRequest("You are not owner of this pet")
    }
    let result = await super.Model.updateOne({ _id: ObjectId(id) }, { $set: data })
    return result
  }

  async deletePetHistory(id, params) {
    let result = await super.Model.deleteOne({ _id: ObjectId(id) })
    return result
  }

  async getPetHistoryWithVeterinaryData(params) {
    let { pet_id, limit = 10, skip = 0 } = params.query
    limit = Number(limit)
    skip = Number(skip)
    if (!pet_id) {
      throw new BadRequest("pet_id is required")
    }
    let result = await super.Model.aggregate([
      {
        $facet: {
          data: [
            {
              $match: {
                pet_id: pet_id
              }
            },
            {
              $sort: {
                createdAt: -1
              }
            },
            {
              $lookup: {
                from: 'users',
                let: { "userId": "$user_id" },
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
                      veterinary_place: 1
                    }
                  }
                ],
                as: "user"
              }
            },
            {
              $set: {
                user: { $arrayElemAt: ["$user", 0] }
              }
            },
            {
              $skip: skip
            },
            {
              $limit: limit
            },
          ],
          pageInfo: [
            { $match: { pet_id: pet_id } },
            { $group: { _id: null, count: { $sum: 1 } } },
          ],
        }
      },
      {
        $project: {
          total: { $arrayElemAt: ["$pageInfo.count", 0] },
          data: "$data",
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
