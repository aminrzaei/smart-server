const express = require('express');
const mongoose = require('mongoose');

const Widget = mongoose.model('Widget');
const User = mongoose.model('User');

const requireAuth = require('../middlewares/requireAuth');
const socketAdder = require('../middlewares/socketAdder');

const router = express.Router();

router.post(
  '/action/led/switch',
  socketAdder,
  requireAuth,
  async (req, res) => {
    const widgetName = 'LED Control';
    const actionName = 'Switch ON/OFF';
    const { newState } = req.body;
    const { arduinoToken } = req.user;
    try {
      User.findOne({ email: req.user.email }, function (err, userData) {
        if (userData) {
          const updatedWidgets = userData.widgets.map((widget) => {
            if (widgetName === widget.name) {
              const actions = widget.actions.map((action) => {
                if (actionName === action.name) {
                  const newAction = { ...action, state: newState };
                  return newAction;
                } else return action;
              });
              return { ...widget, actions };
            } else return widget;
          });
          userData.widgets = updatedWidgets;
          userData.save(function (err) {
            if (err) res.status(422).send(err.message);
          });

          req.io.to(arduinoToken).emit('led-switch', { state: newState });
          res.send({ msg: `Widget state set to ${newState}` });
        } else {
          res.status(422).send(err.message);
        }
      });
    } catch (err) {
      return res.status(422).send(err.message);
    }
  }
);

router.get('/action/led/switch', socketAdder, (req, res) => {
  req.io.to('sometoken').emit('led-switch', { state: 'on' });
  res.send('Socket Fired !!!');
});

module.exports = router;
