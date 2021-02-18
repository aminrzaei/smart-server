require('./src/models/User');
require('./src/models/Widget');

const express = require('express');
const http = require('http');
const socket = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = (module.exports.io = socket(server));

const PORT = process.env.PORT || 3000;

const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoutes');
const widgetRoutes = require('./src/routes/widgetRoutes');
const actionRoutes = require('./src/routes/actionRoutes');
const requireAuth = require('./src/middlewares/requireAuth');

app.use(bodyParser.json());
app.use(authRoutes);
app.use(widgetRoutes);
app.use(actionRoutes);

const mongoUri =
  'mongodb+srv://amin:A7667min@cluster0.ikvxk.mongodb.net/smart?retryWrites=true&w=majority';
if (!mongoUri) {
  throw new Error(
    `MongoURI was not supplied.  Make sure you watch the video on setting up Mongo DB!`
  );
}
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
});
mongoose.connection.on('connected', () => {
  console.log('Connected to mongo instance');
});
mongoose.connection.on('error', (err) => {
  console.error('Error connecting to mongo', err);
});

app.get('/', requireAuth, (req, res) => {
  res.send(`Your email: ${req.user.email}`);
});

io.on('connection', (client) => {
  console.log(`Connected... ==> ${client.id}`);

  client.on('arduinoToken', (token) => {
    client.join(token);
  });

  client.on('disconnect', () => {
    console.log(`Disconnected... ==> ${client.id}`);
  });
});

server.listen(PORT, function () {
  console.log('Server listening on port 3000');
});
