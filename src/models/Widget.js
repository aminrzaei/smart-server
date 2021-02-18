const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  name: String,
  icon: String,
  type: String,
  payload: String,
});
const widgetSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  actions: [actionSchema],
});

mongoose.model('Widget', widgetSchema);
