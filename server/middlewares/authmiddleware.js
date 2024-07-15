const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const verifiedtoken = jwt.verify(token, process.env.SECRET_KEY_JWT);
        req.body.userId = verifiedtoken.userId;
        next();
    }
    catch (err) {
        res.status(401).json({ sucess: false, message: "Authentication failed" });
    }
}