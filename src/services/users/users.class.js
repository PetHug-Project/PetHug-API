const { BadRequest, Forbidden, NotFound } = require('@feathersjs/errors');
const { default: axios } = require('axios');
const { Service } = require('feathers-mongoose');
const { firebaseAdmin, firebaseAuth, firebaseApiKey } = require("../../utils/firebaseInit")
const ObjectId = require("mongoose").Types.ObjectId

const firebaseAdminAuth = firebaseAdmin.auth()
exports.Users = class Users extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
  }

  modelProtector(data) {
    delete data.firebase_uid
    delete data.sign_in_provider
    delete data.__v
  }

  async registerUser(data, params) {
    let { email, password } = data
    let user = await firebaseAdminAuth.createUser({
      email: email,
      password: password,
      emailVerified: true,
    })
    try {
      let { uid, providerData } = user
      await super.create({ ...data, firebase_uid: uid, sign_in_provider: providerData[0].providerId })
    } catch (error) {
      throw error
    }
    return await this.loginUser(data)
  }

  async loginUser(data, params) {
    let { email, password } = data
    let result = await firebaseAuth.signInWithEmailAndPassword(firebaseAuth.getAuth(), email, password)
    let { uid, stsTokenManager: token } = result.user
    delete token.expirationTime
    let user = await super.Model.findOne({ firebase_uid: uid })
    return { _id: user._id, fname: user.fname, lname: user.lname, token: token }
  }

  async refreshToken(data, params) {
    let { refreshToken } = data
    let apiKey = firebaseApiKey
    let refreshTokenURL = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`
    let result = await axios.post(refreshTokenURL, { refresh_token: refreshToken, grant_type: "refresh_token" })
      .catch((error) => {
        throw new BadRequest(error.response.data.error.message, error.response.data.error)
      })
    result = result.data
    return { accessToken: result.access_token, refreshToken: result.refresh_token }
  }

  async getUser(id, params) {
    let checkUser = await this.checkUser(id, params)
    if (!checkUser) {
      return new Forbidden("Can't view this user")
    }
    let aggregateQuery = [{
      $match: {
        _id: ObjectId(id)
      }
    },
    {
      $lookup: {
        from: "pets",
        pipeline: [
          {
            $match: {
              "owner._id": ObjectId(id)
            }
          },
          {
            $project: {
              pet_image: "$pet_image",
              pet_name: "$pet_name",
              pet_birthdate: "$pet_birthdate"
            }
          }
        ],
        as: "pets"
      }
    }]
    let user = await super.Model.aggregate(aggregateQuery)
    if (user.length == 0) {
      return new NotFound("Can't find this user")
    }
    user = user[0]
    this.modelProtector(user)
    if (user.pets.length > 0) {
      user.pets.map(async (item) => {
        let age = await this.app.service('pets').calculateAge(item.pet_birthdate)
        item.pet_age = age
      })
    }
    return user
  }

  async checkUser(id, params) {
    let { decodeAccessToken } = params
    let userFromUserId = await super.get(id, { query: { $select: ["firebase_uid"] } })
    if (userFromUserId.firebase_uid == decodeAccessToken.user_id) {
      return true
    }
    return false
  }

  async getModel() {
    return super.Model
  }

};
