var Issue = require('../models/issue');

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

module.exports = util = {
  transformIssue: (issue) => {
    var d = new Date(issue.sendDate)
    issue.formattedDate =  d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    return issue
  },
  getSent: (done) => {
    Issue.where({sent: true}).sort({sendDate: -1}).exec((err, results) => {
      done(err, results.map(util.transformIssue));
    })
  }
}