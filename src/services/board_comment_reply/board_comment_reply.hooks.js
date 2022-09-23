const firebaseAuthHook = require("../../hooks/firebase-auth-hook");

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [firebaseAuthHook()],
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
