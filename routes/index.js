var express = require('express');
const user = require('../model/user');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const JWT_SECRET="asdfghjklasdfghjkl";

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/home', isloggedIn, function (req, res, next) {
  res.render('home', { title: 'Home' });
});

router.post('/register', (req, res, next) => {
  const { username, password, email } = req.body;
  // console.log(username,email,password)

  var newUser = {
    //user data here
    username,
    email
    //user data here
  };
  user
    .register(newUser, req.body.password)
    .then((result) => {
      // Generate JWT with expiry time
      const token = jwt.sign({ id: result._id, username: result.username }, JWT_SECRET, { expiresIn: '1h' });
      console.log(token)
      // Set cookie with expiry time
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Set to true if using HTTPS
        expires: new Date(Date.now() + 3600000) // 1 hour expiry time
      });

      // console.log(result)


      passport.authenticate('local')(req, res, () => {
        //destination after user register
        res.redirect('/home');
      });
    })
    .catch((err) => {
      res.send(err);
    });
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    if (!user) {
      return res.status(401).redirect('/'); // Unauthorized - invalid credentials
    }

    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).send(err.message);
      }

      // Generate JWT
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

      // Set JWT in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Set to true if using HTTPS
        expires: new Date(Date.now() + 3600000), // 1 hour expiry time
        sameSite: 'Strict'

      });

      // Redirect after successful login
      res.redirect('/home');
    });
  })(req, res, next);
});
//logout 
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    // Clear the JWT cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: true, // Set to true if using HTTPS
      sameSite: 'Strict'
    });
    res.redirect('/'); // Redirect to the homepage or login page
  });
});


function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  else res.redirect('/');
}


module.exports = router;
