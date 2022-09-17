const { BadRequest, Forbidden, NotFound, NotAuthenticated } = require('@feathersjs/errors');
const { default: axios } = require('axios');
const { Service } = require('feathers-mongoose');
const { AuthError } = require('../../constants/AuthError');
const { firebaseAdmin, firebaseAuth, firebaseApiKey } = require("../../utils/firebaseInit")
const { ObjectId } = require("mongoose").Types

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
    const defaultUserImage = "https://cdn-icons-png.flaticon.com/512/634/634741.png"
    if (!data.user_image) {
      data.user_image = defaultUserImage
    }
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

  async getDataPublic(id, params) {
    let result = await super.Model.find({ _id: ObjectId(id) }, { _id: 1, fname: 1, lname: 1, user_image: 1 })
    if (result.length <= 0) {
      throw new NotFound("User not found")
    }
    return result[0]
  }

  async getDataFromFirebaseUid(firebaseUid) {
    let result = await super.Model.find({ firebase_uid: firebaseUid }, { _id: 1, email: 1, fname: 1, lname: 1, user_image: 1 })
    if (result.length <= 0) {
      throw new NotFound("User not found")
    }
    return result[0]
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

  async loginWithEmail(data, params) {
    let { email, password } = data
    let result = await firebaseAuth.signInWithEmailAndPassword(firebaseAuth.getAuth(), email, password)
    let { user: userFirebase } = result
    let accessToken = userFirebase.toJSON().stsTokenManager.accessToken
    let user = await this.loginUser({ firebase_uid: userFirebase.uid }, params)
    return { user, accessToken }
  }
};
