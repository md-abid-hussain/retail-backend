const express = require('express')
const router = express.Router()
const verifyJWT = require('../middleware/verifyJWT')
const userController = require('../controllers/userController')

router.use(verifyJWT)

router.route('/')
    .get(userController.getAllUsers)

module.exports = router