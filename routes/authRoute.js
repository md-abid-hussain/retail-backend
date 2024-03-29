const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const loginLimiter = require("../middleware/loginLimiter");

router.route('/').post(authController.login);
router.route('/register').post(authController.register);
router.route('/refresh').get(authController.refresh);
router.route('/logout').post(authController.logout);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password/:token').put(authController.resetPassword);

module.exports = router;