const { disallow } = require("feathers-hooks-common")
const firebaseAuth = require("../../hooks/firebase-auth-hook")

module.exports = {
  before: {
    all: [],
    find: [],
    get: [firebaseAuth()],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
