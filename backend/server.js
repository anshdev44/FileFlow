const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const healthcheckRoute = require("./src/routes/healthcheck.route");
const { checkconnection } = require("./src/controllers/checknetwork");
const { checkip } = require("./src/controllers/getHostip");
const { initializeSocket } = require("./src/sockets/socketManager");
const app = express();
const port = 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000, //i am adding these lines because a socket io connection always sends signal is the connection died or still working but when tranferring a large file this signal gets ignored due to which file transfers fails  
  pingInterval: 25000,
  maxHttpBufferSize: 1e8
});

initializeSocket(io);
// mount healthcheck route
app.use("/healthcheck", healthcheckRoute);

// endpoint to check current Wi-Fi connection
app.get("/network", checkconnection);

app.use('/getip', checkip)

app.get("/", (req, res) => {
  res.send("Hello World!");
});



server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});