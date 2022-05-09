var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const res = require('express/lib/response');
const fs = require("fs");

let channelStr=fs.readFileSync(__dirname+'/server_config/channel.json');
let channel = JSON.parse(channelStr).channelList;
http.listen(80);
app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});
app.get('/channelList',function(req,res){
  res.sendFile(__dirname+'/server_config/channel.json');
});
console.log("listened to 80");

io.on('connection', function (socket) {
  console.log('connected');
  socket.on('disconnect', function(){
    console.log('disconnected');
  });
  channel.forEach(element => {
    socket.on(element.name,function(msg){
      socket.broadcast.emit(element.name,msg)
      console.log(element.name+'channel recived '+msg);
    });
  });

});  
