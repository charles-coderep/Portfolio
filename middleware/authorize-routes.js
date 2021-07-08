const jwt = require('jsonwebtoken');

let authRoute = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/auth/login');
            }
            else {
                next();
            }
        })
    }
    else {
        res.redirect('/auth/login');
    }
}

let checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.id = null;
                next();
            }
            else {
                const id = decodedToken.id;
                res.locals.id = id;
                next();
            }
        })
    }
    else {
        res.locals.id = null;
        next();
    }
}

module.exports = { checkUser, authRoute };
