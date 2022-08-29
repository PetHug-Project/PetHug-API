/* eslint-disable no-unused-vars */
const { firebaseAdmin } = require("../../utils/firebaseInit")
const sharp = require("sharp")

exports.UploadFile = class UploadFile {
  constructor(options, app) {
    this.options = options || {};
    this.app = app
  }

  async find() {
    return {}
  }

  async handleSingleImage(params) {
    const { files } = params
    const file = files[0]
    const fileName = await this.resizeAndUpload(file)
    return { image_path: `https://firebasestorage.googleapis.com/v0/b/${this.app.get('storage_bucket')}/o/${fileName}?alt=media` }
  }

  async handleUploadFile(params) {
    const { files } = params
    const fileNameArr = []
    let errorFileUploaded = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileUploaded = await this.resizeAndUpload(file)
      if (fileUploaded.error) {
        errorFileUploaded.push(fileUploaded.error)
        continue
      }
      fileNameArr.push(fileUploaded)
    }
    return { images_name: fileNameArr, errorFiles: errorFileUploaded }
  }

  async resizeAndUpload(file) {
    const bucket = firebaseAdmin.storage().bucket(this.app.get("storage_bucket"))
    const fileName = `${Date.now()}_${file.originalname.replace(/\s/g, "_")}`
    const resizeImageFunction = async (buffer) => {
      let imageAfterResize = await sharp(buffer).resize({ width: 2048 }).jpeg({ quality: 80 }).toBuffer()
      if (imageAfterResize.byteLength > 5000000) {
        await resizeImageFunction(imageAfterResize)
      }
      return imageAfterResize
    }
    const resizedImage = await resizeImageFunction(file.buffer)

    try {
      await bucket.file(fileName).save(resizedImage)
    } catch (error) {
      return { error: fileName }
    }

    return fileName
  }

}
