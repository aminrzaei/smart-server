const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = mongoose.model('User');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { email, password, arduinoToken } = req.body;

  try {
    const user = new User({ email, password, arduinoToken });
    await user.save();

    const token = jwt.sign({ userId: user._id }, 'BE_SMART');
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({ error: 'Must provide email and password' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, 'BE_SMART');
    const arduinoToken = await user.arduinoToken;
    res.send({ token, arduinoToken });
  } catch (err) {
    return res.status(422).send({ error: 'Invalid password or email' });
  }
});

router.post('/refresh-token', requireAuth, async (req, res) => {
  const { newArduinoToken } = req.body;
  try {
    User.findOne({ email: req.user.email }, function (err, userData) {
      if (userData) {
        userData.arduinoToken = newArduinoToken;
        res.send({ arduinoToken: newArduinoToken });
        userData.save(function (err) {
          if (err) res.status(422).send(err.message);
        });
      } else {
        res.status(422).send(err.message);
      }
    });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

module.exports = router;
