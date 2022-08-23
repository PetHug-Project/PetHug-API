// Initializes the `boards` service on path `/board-service`
const { Boards } = require('./boards.class');
const createModel = require('../../models/boards.model');
const hooks = require('./boards.hooks');
const firebaseAuthHook = require('../../hooks/firebase-auth-hook');

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
    },
    async get(id, params) {
      return await boardService.get(id, params);
    }
  })
  app.service('boards').hooks(hooks);

  app.use('/like-board', {
    async get(id, params) {
      return await boardService.likeBoard(id, params);
    },
    async remove(id, params) {
      return await boardService.unLikeBoard(id, params);
    }
  })
  app.service('like-board').hooks({
    before: {
      get: [firebaseAuthHook()],
      remove: [firebaseAuthHook()]
    }
  });

  app.use('/board-random', {
    async get(id, params) {
      return await boardService.randomBoard(id, params);
    },
    async find(params) {
      return await boardService.randomBoard(null, params);
    }
  })

  app.use('/most-like-board', {
    async find(params) {
      return await boardService.findBoardSortByLike(params);
    }
  })
};
