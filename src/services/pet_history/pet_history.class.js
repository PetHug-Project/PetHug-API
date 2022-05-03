const { Service } = require('feathers-mongoose');
const { ObjectId } = require("mongoose").Types
exports.PetHistory = class PetHistory extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  async addPetHistory(data, params) {
    const { pet_id } = params.query
    let result = await super.create({ pet_id, ...data })
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
    let result = await super.Model.updateOne({ _id: ObjectId(id) }, { $set: data })
    return result
  }

  async deletePetHistory(id, params) {
    let result = await super.Model.deleteOne({ _id: ObjectId(id) })
    return result
  }

};
