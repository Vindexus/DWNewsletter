var express = require('express');
var router = express.Router();
var Entry = require('../models/entry');
var Issue = require('../models/issue');
var mongoose = require('mongoose');
var {requireAdmin} = require('../lib/middleware');

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
    Entry.find({_id: {$in: entryIds}, deleted: false}, (err, entries) => {
      if(err) {
        return done(err);
      }

      const map = entries.reduce((m, entry, index) => {
        m[entry._id] = entry;
        return m
      }, {});

      var sorted = scope.issue.entryIds.map((id) => {
        return map[id]
      })

      return done(null, sorted);
    });
  })
}

router.post('/create', requireAdmin, function(req, res, next) {
  var entry = req.body
  Issue.create(entry, (err, result) => {
    req.flash('success', 'Issues updated')
    res.redirect('/issues/' + result._id);
  })
});

router.get('/', requireAdmin, function(req, res, next) {
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

router.get('/:id', requireAdmin, function(req, res, next) {
  Issue.find({_id: mongoose.Types.ObjectId(req.params.id)}, (err, issue) => {
    var scope = {issue: issue[0]};
    getIssueEntries(req.params.id, (err, entries) => {
      scope.issueEntries = entries;
      const eids = entries
        .filter((e) => {
          return !!e
        })
        .map((e) => {return e._id})
      Entry.find({_id: {$nin: eids}, deleted: false, status: 'approved'}, (err, results) => {
        scope.approvedEntries = results;
        res.render('manager/issues/edit_issue', scope);
      });
    });
  });
});

router.get('/:id/html', requireAdmin, function(req, res, next) {
  getIssueEntries(req.params.id, (err, entries) => {
    var scope = {};
    scope.entries = entries;
    res.render('manager/issues/html', scope);
  });
});

router.get('/:id/markdown', requireAdmin, function(req, res, next) {
  getIssueEntries(req.params.id, (err, entries) => {
    var scope = {};
    scope.entries = entries;
    res.render('manager/issues/markdown', scope);
  });
});

router.get('/:id/markdown-gplus', requireAdmin, function(req, res, next) {
  getIssueEntries(req.params.id, (err, entries) => {
    var scope = {};
    scope.entries = entries;
    res.render('manager/issues/markdown_gplus', scope);
  });
});

router.post('/:id/delete', requireAdmin, function(req, res, next) {
  Issue.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: {deleted: true}}).exec((err, result) => {
    if(err) {

      return res.send(error);
    }
    req.flash('success', 'Issue deleted')
    res.redirect('/issues');
  });
});


router.post('/:id', requireAdmin, function(req, res, next) {
  var issue = req.body;
  Issue.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: issue}).exec((err, result) => {
    if(err) {
      req.flash('error', err.toString());
    }
    else {
      req.flash('success', 'Issue updated')
    }
    res.redirect('/issues/' + req.params.id);
  });
});

router.post('/:id/entries', requireAdmin, function(req, res, next) {
  Issue.update({_id: mongoose.Types.ObjectId(req.params.id)}, {$set: {entryIds: req.body.entryIds}}).exec((err, result) => {
    if(err) {
      return res.send(error);
    }

    getIssueEntries(req.params.id, (err, entries) => {
      res.render('manager/issues/html', {entries: entries});
    });
  });
});

router.post('/:id/entries/sent', requireAdmin, function(req, res, next) {
  Issue.find({_id: mongoose.Types.ObjectId(req.params.id)}, (err, issue) => {
    var scope = {issue: issue[0]};
    getIssueEntries(req.params.id, (err, entries) => {
      Entry.updateMany({_id: {$in: entries.map((e) => {return e._id})}, deleted: false}, {$set: {status: 'sent'}}, (err, results) => {
        if(err) {
          req.flash('error', err.toString());
        }
        else {
          req.flash('success', 'Entries set as sent')
        }
        res.redirect('/issues/' + req.params.id);
      });
    });
  });
});

module.exports = router;
