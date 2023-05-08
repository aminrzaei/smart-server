require("./src/models/User");
require("./src/models/Widget");

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const devices = (module.exports.devices = {});

var _ = require("lodash");

const PORT = process.env.PORT || 80;

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./src/routes/authRoutes");
const widgetRoutes = require("./src/routes/widgetRoutes");
const actionRoutes = require("./src/routes/actionRoutes");
const requireAuth = require("./src/middlewares/requireAuth");

app.use(bodyParser.json());
app.use(authRoutes);
app.use(widgetRoutes);
app.use(actionRoutes);

// MongoDB
const mongoUri = process.env.DATABASE_URL;
if (!mongoUri) {
  throw new Error(
    `MongoURI was not supplied.  Make sure you watch the video on setting up Mongo DB!`
  );
}
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
});
mongoose.connection.on("connected", () => {
  console.log("Connected to mongo instance");
});
mongoose.connection.on("error", (err) => {
  console.error("Error connecting to mongo", err);
});

// Websocket
wss.on("connection", function connection(ws, request) {
  console.log("A device connected!");

  const tokenReqMsg = { eventName: "token-req-msg", payload: {} };
  ws.send(JSON.stringify(tokenReqMsg));

  ws.on("message", function incoming(data) {
    const msg = JSON.parse(data);
    if (msg.eventName === "arduino-token") {
      ws.ardToken = msg.payload;
      _.set(devices, msg.payload, ws);
    }
  });

  ws.on("close", () => {
    _.omit(devices, ws.ardToken);
  });
});

app.get("/devices", (req, res) => {
  res.send({ allDevices: devices });
});

app.get("/", requireAuth, (req, res) => {
  res.send(`Your email: ${req.user.email}`);
});

server.listen(PORT, function () {
  console.log(`Server listening on port ${PORT}`);
});
