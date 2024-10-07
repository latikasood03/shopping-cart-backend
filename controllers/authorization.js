const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(422).json({ message: 'Email address already in use.' });
        }
        const hashedPassword = await bcrypt.hash(password,12);
        const user = new User({
            name: name,
            email: email,
            password: hashedPassword
        });
        const result = await user.save();
        res.status(201).json({message: "User created", userId: result._id});
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    
    let loadedUser;

    try {
    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(401).json({ message: 'A user with this email address could not be found.' });
    }
    
    loadedUser = user; 

    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
        return res.status(401).json({ message: 'Wrong password!' });
    }
    
    const token = jwt.sign(
        {
            email: loadedUser.email,
            userId: loadedUser._id.toString(),
        },
        'secrettokencode',
        { expiresIn: '1h' }
    );
    res.status(200).json({ token, userId: loadedUser._id.toString() });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
          }        
        next(err);
    }
}