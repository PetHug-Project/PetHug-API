const users = require('./users/users.service.js');
const pets = require('./pets/pets.service.js');
const uploadFile = require('./upload-file/upload-file.service.js');
const petHistory = require('./pet_history/pet_history.service.js');
const boards = require('./boards/boards.service.js');
const boardComment = require('./board_comment/board_comment.service.js');
const boardCommentReply = require('./board_comment_reply/board_comment_reply.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(pets);
  app.configure(uploadFile);
  app.configure(petHistory);
  app.configure(boards);
  app.configure(boardComment);
  app.configure(boardCommentReply);
}
