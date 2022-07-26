// Initializes the `boards` service on path `/board-service`
const { Boards } = require('./boards.class');
const createModel = require('../../models/boards.model');
const hooks = require('./boards.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const boardService = new Boards(options, app);
  app.use('/board-service', boardService);
  app.service('board-service').hooks(hooks);

  app.use('/boards', {
    async find(params) {
      return await boardService.findAllBoards(params);
    },
    async create(data, params) {
      return await boardService.createBoard(data, params);
    }
  })
  app.service('boards').hooks(hooks);
};
