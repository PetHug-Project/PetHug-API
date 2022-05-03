// pet_history-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'pet_history';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    pet_id: { type: String, required: true },
    user_id: { type: String, required: true },
    date: { type: Date, required: true },
    treat_name: { type: String, required: true },
    treat_description: { type: String, required: true },
    hospital_name: { type: String, required: true },
  }, {
    timestamps: true,
    collection: 'pet_history'
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);

};
