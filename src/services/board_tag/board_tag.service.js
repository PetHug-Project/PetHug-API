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
  const boardTagService = new BoardTag(options, app);
  app.use('/board-tag-service', boardTagService);

  app.use('/board-tag', {
    async find(params) {
      return await boardTagService.find(params);
    },
    async create(data, params) {
      return await boardTagService.create(data, params);
    }
  })

  // Get our initialized service so that we can register hooks
  const service = app.service('board-tag-service');

  service.hooks(hooks);
};
