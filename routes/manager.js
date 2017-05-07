var express = require('express');
var router = express.Router();
var Entry = require('../models/entry');
var Issue = require('../models/issue');
var mongoose = require('mongoose');

function requireAdmin (req, res, next) {
  if(req.user && req.user.admin) {
    return next();
  }

  res.redirect('/');
}

function getIssueEntries (issueId, done) {
  Issue.where({_id: mongoose.Types.ObjectId(issueId)}).exec((err, result) => {
    var scope =  {};
    if(err) {
      scope.error = err;
    }
    else {
      scope.issue = result[0];
    }
    var entryIds = scope.issue.entryIds || [];
    Entry.find({_id: {$in: entryIds}, deleted: false}, done);
  })
}

router.post('/addentry', requireAdmin, function(req, res, next) {
  var entry = req.body
  entry.status = 'pending';
  Entry.create(entry, (err, result) => {
    res.redirect('/manager/entry/' + result._id);
  })
});

router.get('/', requireAdmin, function(req, res, next) {
  Entry.where({
    status: 'pending',
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

router.get('/entry/:id', requireAdmin, function(req, res, next) {
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


router.post('/entry/:id/delete', requireAdmin, function(req, res, next) {
  Entry.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: {deleted: true}}).exec((err, result) => {
    if(err) {
      return res.send(error);
    }
    res.redirect('/manager');
  });
});

module.exports = router;


router.post('/entry/:id', requireAdmin, function(req, res, next) {
  var entry = req.body;
  entry.pdf = !!req.body.pdf;
  entry.paid = !!req.body.paid;
  Entry.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: entry}).exec((err, result) => {
    if(err) {
      return res.send(error);
    }

    res.redirect('/manager/entry/' + req.params.id);
  });
});

//===========================

router.post('/addissue', requireAdmin, function(req, res, next) {
  var entry = req.body
  Issue.create(entry, (err, result) => {
    res.redirect('/manager/issue/' + result._id);
  })
});

router.get('/issues', requireAdmin, function(req, res, next) {
  Issue.where({
    deleted: false
  }).sort({sendDate: -1}).exec((err, results) => {
    var scope =  {};
    if(err) {
      scope.error = err;
    }
    else {
      scope.issues = results;
    }
    res.render('manager/issues/index', scope);
  });
});

router.get('/issue/:id', requireAdmin, function(req, res, next) {
  Issue.find({_id: mongoose.Types.ObjectId(req.params.id)}, (err, issue) => {
    var scope = {issue: issue[0]};
    getIssueEntries(req.params.id, (err, entries) => {
      scope.issueEntries = entries;
      Entry.find({_id: {$nin: entries.map((e) => {return e._id})}, deleted: false, status: 'approved'}, (err, results) => {
        scope.approvedEntries = results;
        res.render('manager/issues/edit_issue', scope);
      });
    });
  });
});

router.get('/issue/:id/html', requireAdmin, function(req, res, next) {
  getIssueEntries(req.params.id, (err, entries) => {
    var scope = {};
    scope.entries = entries;
    res.render('manager/issues/html', scope);
  });
});


router.post('/issue/:id/delete', requireAdmin, function(req, res, next) {
  Issue.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: {deleted: true}}).exec((err, result) => {
    if(err) {
      return res.send(error);
    }
    res.redirect('/manager/issues');
  });
});


router.post('/issue/:id', requireAdmin, function(req, res, next) {
  var issue = req.body;
  Issue.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: issue}).exec((err, result) => {
    if(err) {
      return res.send(error);
    }

    res.redirect('/manager/issue/' + req.params.id);
  });
});

router.post('/issue/:id/entries', requireAdmin, function(req, res, next) {
  Issue.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: {entryIds: req.body.entryIds}}).exec((err, result) => {
    if(err) {
      return res.send(error);
    }

    getIssueEntries(req.params.id, (err, entries) => {
      res.render('manager/issues/html', {entries: entries});
    });
  });
});

module.exports = router;
