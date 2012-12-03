module.exports = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { 
		res.locals.user = req.user;
    	return next(); 
    }
    if(req.route.method === "get") {
    	req.session.redirect_to = req.path;
    	res.redirect('/login');
	}
	else {
		res.status(403).send("Unauthorized");
	}
};
