module.exports = function csrf(req, res, next) {
  res.locals.token = req.session._csrf;
  next();
}