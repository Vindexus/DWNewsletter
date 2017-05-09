var express = require('express');
var router = express.Router();
var Entry = require('../models/entry');
var Issue = require('../models/issue');
var mongoose = require('mongoose');
var {requireAdmin} = require('../lib/middleware');

router.post('/create', requireAdmin, function(req, res, next) {
  var entry = req.body
  entry.status = 'pending';
  Entry.create(entry, (err, result) => {
    res.redirect('/entries/' + result._id);
  })
});

router.get('/', requireAdmin, function(req, res, next) {
  const status = req.query.status || 'pending';
  Entry.where({
    status: status,
    deleted: false
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

router.get('/add', requireAdmin, function(req, res, next) {
  res.render('manager/entries/add', {title: 'Add Entry'});
});

router.get('/:id', requireAdmin, function(req, res, next) {
  Entry.where({_id: mongoose.Types.ObjectId(req.params.id)}).exec((err, result) => {
    var scope =  {};
    if(err) {
      scope.error = err;
    }
    else {
      scope.entry = result[0];
    }
    res.render('manager/entries/edit_entry', scope);
  });
});

router.post('/:id/delete', requireAdmin, function(req, res, next) {
  Entry.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: {deleted: true}}).exec((err, result) => {
    if(err) {
      return res.send(error);
    }
    res.redirect('/entries');
  });
});

module.exports = router;


router.post('/:id', requireAdmin, function(req, res, next) {
  var entry = req.body;
  entry.pdf = !!req.body.pdf;
  entry.paid = !!req.body.paid;
  Entry.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: entry}).exec((err, result) => {
    if(err) {
      return res.send(error);
    }

    res.redirect('/entries/' + req.params.id);
  });
});


module.exports = router;
