const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const healthcheckRoute = require("./src/routes/healthcheck.route");
const { checkconnection } = require("./src/controllers/checknetwork");
const app = express();
const port = 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});




// mount healthcheck route
app.use("/healthcheck", healthcheckRoute);

// endpoint to check current Wi-Fi connection
app.get("/network", checkconnection);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});