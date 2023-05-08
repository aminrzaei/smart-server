const express = require('express');
const mongoose = require('mongoose');

const Widget = mongoose.model('Widget');
const User = mongoose.model('User');

const requireAuth = require('../middlewares/requireAuth');
const devicesAdder = require('../middlewares/devicesAdder');

const router = express.Router();

var _ = require('lodash');

router.post(
  '/action/led/switch',
  devicesAdder,
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

          const msg = { eventName: 'switch-led', payload: newState };

          req.devices[arduinoToken].send(JSON.stringify(msg));
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

router.get('/turn-on', devicesAdder, async (req, res) => {
  const msg = { eventName: 'switch-led', payload: 'on' };
  req.devices['87e2f588-0dd8-4c0d-a12f-98e682c6ba54'].send(JSON.stringify(msg));
  res.send({ msg: 'ON' });
});

router.get('/turn-off', devicesAdder, async (req, res) => {
  const msg = { eventName: 'switch-led', payload: 'off' };
  req.devices['87e2f588-0dd8-4c0d-a12f-98e682c6ba54'].send(JSON.stringify(msg));
  res.send({ msg: 'OFF' });
});

module.exports = router;
