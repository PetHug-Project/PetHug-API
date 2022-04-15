/* eslint-disable no-unused-vars */
const { firebaseAdmin } = require("../../utils/firebaseInit")
const sharp = require("sharp")

exports.UploadFile = class UploadFile {
  constructor(options, app) {
    this.options = options || {};
    this.app = app
  }

  async handleSingleImage(params) {
    const { files } = params
    const file = files[0]
    const fileName = await this.resizeAndUpload(file)
    return { image_name: fileName }
  }

  async handleFile(params) {
    const { files } = params
    const fileNameArr = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = await this.resizeAndUpload(file)
      fileNameArr.push(fileName)
    }
    return { images_name: fileNameArr }
  }

  async resizeAndUpload(file) {
    const bucket = firebaseAdmin.storage().bucket()
    const fileName = `${Date.now()}_${file.originalname.replace(/\s/g, "_")}`
    const resizeImageFunction = async (buffer) => {
      let imageAfterResize = await sharp(buffer).resize({ width: 2048 }).jpeg({ quality: 80 }).toBuffer()
      if (imageAfterResize.byteLength > 5000000) {
        await resizeImageFunction(imageAfterResize)
      }
      return imageAfterResize
    }
    const resizedImage = await resizeImageFunction(file.buffer)

    await bucket.file(fileName).save(resizedImage)

    return fileName
  }

}
