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
  app.use('/upload-service', uploadFile)
  app.service('upload-service').hooks(hooks)

  app.use('/upload-image-single', multer.fields([
    {
      name: 'img',
      maxCount: 1
    }
  ]), async (req, res, next) => {
    if (!req.files || !req.files.img) {
      return res.status(500).send({ error: "Please send image to upload" })
    }
    req.feathers.files = req.files.img
    next()
  }, {
    async create(data, params) {
      return await uploadFile.handleSingleImage(params)
    }
  })

  app.use('/upload-images', multer.fields([
    {
      name: 'img',
      maxCount: 3
    }
  ]), async (req, res, next) => {
    if (!req.files || !req.files.img) {
      return res.status(500).send({ error: "Please send image to upload" })
    }
    req.feathers.files = req.files.img
    next()
  }, {
    async create(data, params) {
      return await uploadFile.handleUploadFile(params)
    }
  })
};
