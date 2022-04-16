// pets-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'pets';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    pet_image: { type: String, default: "" },
    pet_name: { type: String, required: true },
    pet_birthdate: { type: Date, required: true },
    pet_gender: { type: String, required: true },
    pet_type: { type: String, required: true },
    pet_breed: { type: String, require: true },
    pet_color: { type: String, default: "" },
    pet_history: { type: Array, default: [] },
    owner: { type: Object, required: true },
    isLost: { type: Boolean, default: false },
    qr_code_for_show: { type: String, default: "" },
    pet_health_note: { type: String, default: "" },
  })

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);

};
