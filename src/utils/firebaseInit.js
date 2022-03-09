const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const app = feathers().configure(configuration())

const { cert, initializeApp } = require("firebase-admin/app");
const firebaseConfig = app.get('firebaseConfig')
initializeApp({ credential: cert(firebaseConfig), storageBucket: firebaseConfig.storage_bucket })

const firebaseAdmin = require("firebase-admin")

module.exports = firebaseAdmin
