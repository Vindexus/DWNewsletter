var express = require('express');
var router = express.Router();
var Entry = require('../models/entries');
var mongoose = require('mongoose');

function requireAdmin (req, res, next) {
  if(req.user && req.user.admin) {
    return next();
  }

  res.redirect('/');
}

router.post('/addentry', requireAdmin, function(req, res, next) {
  var entry = req.body
  entry.status = 'pending';
  Entry.create(entry, (err, result) => {
    res.redirect('/' + result._id);
  })
});

router.get('/', requireAdmin, function(req, res, next) {
  Entry.where({
    status: 'pending'
  }).sort({created: -1}).exec((err, results) => {
    var scope =  {};
    if(err) {
      scope.error = err;
    }
    else {
      scope.entries = results;
    }
    res.render('manager/entries/index', scope);
  });
});

router.get('/entry/:id', requireAdmin, function(req, res, next) {
  Entry.where({_id: mongoose.Types.ObjectId(req.params.id)}).exec((err, result) => {
    var scope =  {};
    if(err) {
      scope.error = err;
    }
    else {
      scope.entry = result[0];
    }
    console.log('entry', scope.entry);
    res.render('manager/entries/edit_entry', scope);
  });
});

router.post('/entry/:id', requireAdmin, function(req, res, next) {
  var entry = req.body;
  entry.pdf = !!req.body.pdf;
  entry.paid = !!req.body.paid;
  Entry.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: entry}).exec((err, result) => {
    var scope =  {};
    if(err) {
      return res.send(error);
    }

    res.redirect('/manager/entry/' + req.params.id);
  });
});

module.exports = router;
