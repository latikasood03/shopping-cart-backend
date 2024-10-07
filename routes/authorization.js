const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/authorization');

const router = express.Router();

router.post('/signup', 
    [
        body('name')
            .trim()
            .not()
            .isEmpty(),
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address')
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({ min: 5 }),
    ],
     authController.signup);

router.post('/login', 
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address')
            .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .trim()
            .isLength({ min: 5 }),
    ],
     authController.login)

module.exports = router;