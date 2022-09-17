// Initializes the `board_tag` service on path `/board-tag`
const { BoardTag } = require('./board_tag.class');
const createModel = require('../../models/board_tag.model');
const hooks = require('./board_tag.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/board-tag', new BoardTag(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('board-tag');

  service.hooks(hooks);
};
