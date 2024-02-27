const session = require('express-session');

const loginRequired = (req, res, next) => {
    if (!req.session.user || !req.session.user.username) {
      return res.status(401).redirect('/auth/sign-in');
    }
    next();
};

const roleRequired = (role) => {
  return (req, res, next) => {
    if(!req.session.user){
      return res.status(401).redirect('/auth/sign-in');
    }
    if (req.session.user.role !== role) {
      return res.status(403).send("Forbidden");
    }
    next();
  };
};

module.exports = {
  loginRequired, roleRequired
};
