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
    let result
    try {
      result = await firebaseAuth.signInWithEmailAndPassword(firebaseAuth.getAuth(), email, password)
    } catch (error) {
      if (error.code == "auth/user-not-found") {
        throw new BadRequest(AuthError.USER_NOT_FOUND, error)
      }
      if (error.code == "auth/wrong-password") {
        throw new BadRequest(AuthError.WRONG_PASSWORD, error)
      }
      throw new Error(error)
    }
    let { uid, stsTokenManager: token } = result.user
    delete token.expirationTime
    let user = await super.Model.findOne({ firebase_uid: uid })
    return { _id: user._id, fname: user.fname, lname: user.lname, user_image: user.user_image, token: token }
  }

  async refreshToken(data, params) {
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

};
