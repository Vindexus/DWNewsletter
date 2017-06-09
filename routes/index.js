var express = require('express');
var router = express.Router();

var passport = require('passport');
var Account = require('../models/account');

var issuesUtil = require('../lib/issues');

/* GET home page. */
router.get('/', function(req, res, next) {
  issuesUtil.getSent((err, issues) => {
    res.render('index', {issues: issues});
  });
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
  Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
    if (err) {
      return res.render('register', { account : account, error: err.message });
    }

    passport.authenticate('local')(req, res, function () {
      res.redirect('/');
    });
  });
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/entries');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/ping', function(req, res){
    res.status(200).send("pong!");
});

module.exports = router;
