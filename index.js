const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const passport = require("passport");

app.use("/static", express.static(path.join(__dirname, "uploads")));

const http = require("http").createServer(app);
// const io = require("socket.io")(http);
const io = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    transports: ["websocket"],
  },
});
global.socketIO = io;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// app.use(cors({}));
app.use(passport.initialize());
require("./passport/passport")(passport);
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);

const port = 8080;
const route = require("./v1/route");

require("./db");

http.listen(port, () => {
  console.log(`Server is running at port: ${port}`);
});

app.use("/", route);

io.on("connection", (socket) => {
  console.log("A user connected");

  // socket.on("chat message", (message) => {
  //   console.log("Received message:", message);

  //   io.emit("chat message", message);
  // });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
