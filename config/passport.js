const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../model/user');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;
