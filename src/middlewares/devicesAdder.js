const { devices } = require('../../index');
module.exports = (req, res, next) => {
  req.devices = devices;
  next();
};
