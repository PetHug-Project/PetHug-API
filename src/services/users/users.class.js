const { BadRequest } = require('@feathersjs/errors');
const { default: axios } = require('axios');
const { Service } = require('feathers-mongoose');
const { firebaseAdmin, firebaseAuth, firebaseApiKey } = require("../../utils/firebaseInit")

const firebaseAdminAuth = firebaseAdmin.auth()
exports.Users = class Users extends Service {
  constructor(options, app) {
    super(options, app)
    this.app = app
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

};
