// Initializes the `board_comment_reply` service on path `/board-comment-reply`
const { BoardCommentReply } = require('./board_comment_reply.class');
const createModel = require('../../models/board_comment_reply.model');
const hooks = require('./board_comment_reply.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const boardCommentReplyService = new BoardCommentReply(options, app);
  app.use('/board-comment-reply-service', boardCommentReplyService);
  app.service('board-comment-reply-service').hooks(hooks);

  app.use('/board-comment-reply', {
    async create(data, params) {
      return await boardCommentReplyService.createBoardCommentReply(data, params);
    },
    async get(id, params) {
      return await boardCommentReplyService.getMoreCommentReplyWithBoardCommentId(id, params);
    }
  })
  app.service("board-comment-reply").hooks(hooks);
};
