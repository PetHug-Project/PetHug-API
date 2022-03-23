const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const app = feathers().configure(configuration())

const { initializeApp: firebaseAdminInit, cert: firebaseAdminCert } = require("firebase-admin/app")
const { initializeApp: firebaseInit } = require("firebase/app")
const firebaseConfig = app.get('firebaseConfig')
firebaseAdminInit({ credential: firebaseAdminCert(firebaseConfig), storageBucket: firebaseConfig.storage_bucket })
firebaseInit(firebaseConfig)

const firebaseAdmin = require("firebase-admin")
const firebaseAuth = require("firebase/auth")

module.exports = { firebaseAdmin, firebaseAuth }

