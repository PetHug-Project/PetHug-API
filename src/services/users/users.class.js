const { Service } = require('feathers-mongoose');
const { firebaseAdmin, firebaseAuth } = require("../../utils/firebaseInit")

let firebaseAdminAuth = firebaseAdmin.auth()
exports.Users = class Users extends Service {
  constructor(options, app) {
    super(options, app)
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
    let { uid, accessToken } = result.user
    let user = await super.Model.findOne({ firebase_uid: uid })
    return { _id: user._id, fname: user.fname, lname: user.lname, accessToken: accessToken }
  }

};
