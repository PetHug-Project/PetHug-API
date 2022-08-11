// Initializes the `board_comment` service on path `/board-comment`
const { BoardComment } = require('./board_comment.class');
const createModel = require('../../models/board_comment.model');
const hooks = require('./board_comment.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const boardCommentService = new BoardComment(options, app);
  app.use('/board-comment-service', boardCommentService)

  // Get our initialized service so that we can register hooks
  app.service('board-comment-service').hooks(hooks);

  app.use('/board-comment', {
    async create(data, params) {
      return await boardCommentService.createBoardComment(data, params);
    },
    async get(id, params) {
      return await boardCommentService.getAllBoardCommentByBoardId(id, params);
    }
  })
  app.service("board-comment").hooks(hooks)
}
