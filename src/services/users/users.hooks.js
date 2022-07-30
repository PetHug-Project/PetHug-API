const firebaseAuthHook = require("../../hooks/firebase-auth-hook");

module.exports = {
  before: {
    all: [],
    find: [],
    get: [firebaseAuthHook()],
    create: [],
    update: [firebaseAuthHook()],
    patch: [firebaseAuthHook()],
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
