const loginRequired = (req, res, next) => {
    if (!req.session.user || !req.session.user.username) {
      return res.status(401).redirect('/auth/sign-in')
    }
    next();
};

module.exports = loginRequired;
