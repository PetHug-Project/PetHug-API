const mongoose = require('mongoose');
const logger = require('./logger');

module.exports = function (app) {
  console.log("Connecting to Database ...");
  console.log("Database: " + app.get('mongodb'));
  mongoose.connect(
    app.get('mongodb')
  ).then(() => {
    console.log("Connected to Database Successfully");
  }
  ).catch(err => {
    logger.error(err);
    process.exit(1);
  });

  app.set('mongooseClient', mongoose);
};
