// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const { Forbidden } = require("@feathersjs/errors");

// eslint-disable-next-line no-unused-vars
module.exports = (roles = []) => {
  return async context => {
    let { decodeAccessToken } = context.params
    let { uid } = decodeAccessToken
    let userService = context.app.service('users-service')
    let permission = await userService.checkRole(uid, roles)
    if (permission) {
      return context
    }
    throw new Forbidden('You do not have permission to access this resource')
  };
};
