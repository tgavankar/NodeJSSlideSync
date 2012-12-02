module.exports = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    if(req.route.method === "get") {
    	req.session.redirect_to = req.path;
    	res.redirect('/login');
	}
	else {
		res.status(403).send("Unauthorized");
	}
};
