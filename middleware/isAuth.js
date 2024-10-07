const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        return res.status(401).json({message: 'Not Authenticated'});
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, 'secrettokencode');
    } catch(err) {
        return res.status(500).json({message: 'Token can not be verified', err})
    }

    if(!decodedToken) {
        return res.status(401).json({message: 'Not Authenticated'});
    }

    req.userId = decodedToken.userId;
    next();
}