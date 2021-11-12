const jwt = require("jsonwebtoken");
const http = require('http-status-codes');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"]; 
    const token = authHeader && authHeader.split(" ")[1]; 

    if (token == null) return res.sendStatus(http.StatusCodes.UNAUTHORIZED); 

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(http.StatusCodes.FORBIDDEN); 
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken };