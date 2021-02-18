const express = require('express');
const mongoose = require('mongoose');
const Widget = mongoose.model('Widget');
const User = mongoose.model('User');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.get('/widgets', async (req, res) => {
  try {
    // First Way
    // const widgets = Widget.find({}, (err, widgets) => {
    //   res.send({ widgets });
    // });

    // Second Way
    const widgets = await Widget.find({});
    res.send({ widgets });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/user/widget', requireAuth, async (req, res) => {
  const { widgetId } = req.body;
  try {
    const widget = await Widget.findOne({ _id: widgetId });
    User.findOne({ email: req.user.email }, function (err, userData) {
      let repeated = false;
      if (userData) {
        userData.widgets.forEach((widget) => {
          if (widget._id == widgetId) {
            repeated = true;
          }
        });
        if (repeated) {
          res.send({ msg: 'You Added This Widget Before' });
        } else {
          userData.widgets.push(widget);
          userData.save(function (err) {
            if (err) {
              res.status(422).send(err.message);
            }
          });
          res.send({ msg: 'Widget Added Successfully' });
        }
      } else {
        res.status(422).send(err.message);
      }
    });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.get('/user/widget', requireAuth, async (req, res) => {
  const userWidgets = req.user.widgets;
  try {
    res.send({ userWidgets });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

module.exports = router;
