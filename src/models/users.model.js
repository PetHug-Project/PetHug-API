// users-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'users';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    user_image: { type: String, default: "" },
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String, default: "" },
    birthdate: { type: Date, default: "" },
    telno: { type: String, default: "" },
    role: { type: String, default: 'user' },
    pets: { type: Array, default: [] },
    firebase_uid: { type: String, required: true, unique: true },
    sign_in_provider: { type: String, required: true },
    line_uid: { type: String, default: "" },
  }, {
    timestamps: true,
    collection: 'users'
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);

};
