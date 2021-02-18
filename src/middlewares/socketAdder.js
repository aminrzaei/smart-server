const { io } = require('../../index');
module.exports = (req, res, next) => {
  req.io = io;
  next();
};
