const { initializeApp: firebaseAdminInit, cert } = require("firebase-admin/app")
const { initializeApp: firebaseInit } = require("firebase/app")
const firebaseConfig = require("../../firebase_credential.json")
firebaseAdminInit({ credential: cert(firebaseConfig), storageBucket: firebaseConfig.storage_bucket })
firebaseInit(firebaseConfig)

const firebaseAdmin = require("firebase-admin")
const firebaseAuth = require("firebase/auth")

module.exports = { firebaseAdmin, firebaseAuth }

