const express = require("express")
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
let currentTypers = [];
let currentUsers = [];

app.use(express.static("css"));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
  //console.log("a user connected");
  // on connect, add the user to the current users list
  let socketID = socket.id
  currentUsers.push(socketID);
  io.emit("update users list", currentUsers);

  socket.on("disconnect", () => {
    // if user leaves while typing, gets rid of their name in typing div
    // also clears the users name from the user list
    let socketID = socket.id;
    console.log("socket has disconnected");

    currentUsers.splice(currentUsers.indexOf(socketID), 1); 

    if(currentTypers.indexOf(socketID) !== -1){
      console.log("here")
      currentTypers.splice(currentTypers.indexOf(socketID), 1); //removes the wrong user on disconnect???
    }
    io.emit("not typing", socketID, currentTypers);
    io.emit("update users list", currentUsers);
  });

  socket.on("chat message", function(msg) {
    let socketID = socket.id
    console.log("message from " + socketID + ": " + msg);
    io.emit("chat message", msg, socketID);
  });

  // checks if user is typing
  socket.on("typing", () => {
    let socketID = socket.id;
    if(currentTypers.indexOf(socketID) === -1){
      
      currentTypers.push(socketID) //temp workaround for the listener spam
    }
    
    console.log("test");
    io.emit("typing", socketID, currentTypers);
  })

  // checks if user has stopped typing
  socket.on("not typing", ()=>{
    let socketID = socket.id;

    if(currentTypers.indexOf(socketID) !== -1){
      console.log("here")
      currentTypers.splice(currentTypers.indexOf(socketID), 1);
    }
    
    console.log("stopped typing");
    io.emit("not typing", socketID, currentTypers);
  })
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
