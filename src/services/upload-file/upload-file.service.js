// Initializes the `upload-file` service on path `/upload-file`
const { UploadFile } = require('./upload-file.class');
const hooks = require('./upload-file.hooks');

const Multer = require("multer")
const storage = Multer.memoryStorage()
const multer = Multer({
  storage: storage,
  limits: {
    fileSize: 0.6e+7 // 5MB to 6MB
  }
})

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  const uploadFile = new UploadFile(options, app)
  app.use('/upload-file', multer.fields([
    {
      name: 'img'
    }
  ]), async (req, res, next) => {
    if (!req.files) {
      return res.status(500).send({ error: "Please send image to upload" })
    }
    req.feathers.files = req.files.img
    next()
  }, {
    async create(data, params) {
      return await uploadFile.handleFile(params)
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('upload-file');

  service.hooks(hooks);
};
