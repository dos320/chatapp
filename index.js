const express = require("express")
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
let currentTypers = [];
let currentUsers = [];

app.use(express.static(__dirname));

//app.get("/", function(req, res, next){
  //res.send("test");
  //next();
//})

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
  return
});

io.on("connection", function(socket) {
  //console.log("a user connected");
  // on connect, add the user to the current users list
  // also create a new user, and add them to the currentUsers array
  
  let socketID = socket.id
  let newUser = {id: socketID, name: ""}
  //currentUsers.push(socketID);
  
  // this breaks every reference to the currentUsers array, use currentUsers.map(function(e){e.id}).indexOf("text") to fix
  currentUsers.push(newUser) 
  io.emit("update users list", currentUsers);
  io.emit("user join", newUser);

  socket.on("disconnect", () => {
    // if user leaves while typing, gets rid of their name in typing div
    // also clears the users name from the user list
    let socketID = socket.id;
    console.log("socket has disconnected");

    //currentUsers.splice(currentUsers.indexOf(socketID), 1);
    currentUsers.splice(currentUsers.map(function(e){return e.id}).indexOf(socketID)); 

    //if(currentTypers.indexOf(socketID) !== -1){
      if(currentTypers.map(function(e){return e.id}).indexOf(socketID) !== -1){
      currentTypers.splice(currentTypers.map(function(e){return e.id}).indexOf(socketID)); //removes the wrong user on disconnect???
      console.log(currentTypers.length)
    }
    io.emit("not typing", newUser, currentTypers);
    io.emit("update users list", currentUsers);
    io.emit("user leave", newUser);
  });

  socket.on("chat message", function(msg) {
    let socketID = socket.id
    console.log("message from " + socketID + ": " + msg);
    io.emit("chat message", msg, newUser);
  });

  // checks if user is typing
  socket.on("typing", () => {
    let socketID = socket.id;
    if(currentTypers.map(function(e){return e.id}).indexOf(socketID) === -1){
      
      currentTypers.push(newUser) //temp workaround for the listener spam
    }
    
    console.log("test");
    io.emit("typing", newUser, currentTypers);
  })

  // checks if user has stopped typing
  socket.on("not typing", ()=>{
    let socketID = socket.id;

    if(currentTypers.map(function(e){return e.id}).indexOf(socketID) !== -1){
      console.log("here")
      currentTypers.splice(currentTypers.map(function(e){return e.id}).indexOf(socketID), 1);
    }
    
    console.log("stopped typing");
    io.emit("not typing", newUser, currentTypers);
  })

  socket.on("change username", (uname)=>{
    let socketID = socket.id;
    let socketIndex = currentUsers.map(function(e){return e.id}).indexOf(socketID)
    // currentUsers is currently empty, fill it up with users
    if(socketIndex !== -1){
      // will find the user with the correct socketID, and swap its name to "uname"
      currentUsers[socketIndex].name = uname;
      io.emit("user changed name", currentUsers[socketIndex]);
    }
  })
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
