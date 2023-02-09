const jwtSecret = 'you_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
    passport = require('passport');
    
require('./passport'); // Your local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, // This is the username you're encoding
        expiresIn: '7d', // This specifies that the token will expire in 7 days
        algorithm: 'HS256' // this is the algorithm use to 'sign' or encdoe the values of the JWT
    });
}

//post login
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                });
            }
            req.login(user, {session: false}, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({user, token});
            });
        }) (req, res);
        });
    }