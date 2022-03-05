const users = require('./users/users.service.js');
const pets = require('./pets/pets.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(pets);
}
