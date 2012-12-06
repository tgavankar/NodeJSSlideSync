module.exports = function globals(req, res, next) {
  res.locals.token = req.session._csrf;
  res.locals.user = req.user;
  res.locals.base = "http://" + req.headers.host;
  next();
}
