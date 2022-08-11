const { BadRequest, Forbidden, NotFound, NotAuthenticated } = require('@feathersjs/errors');
const { default: axios } = require('axios');
const { Service } = require('feathers-mongoose');
const { AuthError } = require('../../constants/AuthError');
const { firebaseAdmin, firebaseAuth, firebaseApiKey } = require("../../utils/firebaseInit")

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

  async patch(id, data, params) {
    let checkUser = await this.checkUser(id, params)
    if (!checkUser) {
      throw new Forbidden("Can't edit this user")
    }
    let { email } = data
    if (email) {
      let user = await super.Model.findOne({ email: email })
      if (user) {
        if (user._id.toString() != id) {
          throw new BadRequest("Email already exist")
        }
      }
    }
    const result = await super.patch(id, data, params)
    this.modelProtector(result)
    return result
  }

  async registerUser(data, params) {
    return await super.create({ ...data })
  }

  async loginUser(data, params) {
    let { firebase_uid } = data
    let user = await super.Model.findOne({ firebase_uid: firebase_uid })
    return { _id: user._id, fname: user.fname, lname: user.lname, user_image: user.user_image, email: user.email, sign_in_provider: user.sign_in_provider }
  }

  async refreshToken(data, params) { // wait for test && ready to delete
    let { refreshToken } = data
    let apiKey = firebaseApiKey
    let refreshTokenURL = `https://securetoken.googleapis.com/v1/token?key=${apiKey}`
    let result
    try {
      result = await axios.post(refreshTokenURL, { refresh_token: refreshToken, grant_type: "refresh_token" })
      result = result.data
    } catch (error) {
      throw new BadRequest(error.response.data.error.message, error.response.data.error)
    }
    return { accessToken: result.access_token, refreshToken: result.refresh_token }
  }

  async getUser(id, params) {
    let checkUser = await this.checkUser(id, params)
    if (!checkUser) {
      throw new Forbidden("Can't view this user")
    }
    let user = await super.get(id, params)
    this.modelProtector(user)
    return user
  }

  async checkUser(id, params) {
    let { decodeAccessToken } = params
    if (!decodeAccessToken) {
      throw new NotAuthenticated("Please provide Access Token")
    }
    let userFromUserId = await super.get(id, { query: { $select: ["firebase_uid"] } })
    if (userFromUserId.firebase_uid == decodeAccessToken.user_id) {
      return true
    }
    return false
  }

  async getModel() {
    return super.Model
  }

  async findPetByUserId(params) {
    let { user_id } = params.route
    let checkUser = await this.checkUser(user_id, params)
    if (!checkUser) {
      throw new Forbidden("Can't view this user")
    }
    return await this.app.service('pets-service').findPetByUserId(user_id)
  }

  // Dev env only
  async clearAllUser() {
    let users = (await firebaseAdminAuth.listUsers()).users
    let uid = users.map(user => {
      return user.uid
    })
    let result = await firebaseAdminAuth.deleteUsers(uid)
    return result
  }
};
