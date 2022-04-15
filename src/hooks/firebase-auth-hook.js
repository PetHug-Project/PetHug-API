// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
// eslint-disable-next-line no-unused-vars
const { firebaseAdmin } = require("../utils/firebaseInit")

const firebaseAuth = firebaseAdmin.auth()

const { NotAuthenticated } = require('@feathersjs/errors');
const { AuthError } = require("../constants/AuthError");

module.exports = (options = {}) => {
  return async context => {
    const bearerAccessToken = context.params.headers.authorization
    if (!bearerAccessToken) {
      throw new NotAuthenticated('No bearer access token was provided')
    }
    const accessToken = bearerAccessToken.split(" ")[1]
    if (!accessToken) {
      throw new NotAuthenticated("Please send token in format: Bearer <token>")
    }
    let user
    try {
      user = await firebaseAuth.verifyIdToken(accessToken)
    } catch (error) {
      if (error.code == "auth/id-token-expired") {
        throw new NotAuthenticated(AuthError.TOKEN_EXPIRED, error)
      }
      if (error.code == "auth/argument-error") {
        throw new NotAuthenticated(AuthError.TOKEN_INVALID, error)
      }
      throw new NotAuthenticated(error.message, error)
    }
    if (!user.email_verified) {
      await firebaseAuth.updateUser(user.uid, { emailVerified: true })
    }
    context.params.decodeAccessToken = user
    return context;
  };
};
