function requireAdmin (req, res, next) {
  if(req.user && req.user.admin) {
    return next();
  }

  res.redirect('/');
}

module.exports = {
  requireAdmin
}