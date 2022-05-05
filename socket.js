var http = require('http').createServer(handler);
var app = require('express')();
var io = require('socket.io')(http);
const res = require('express/lib/response');

http.listen(80);
app.get('/',function(req,res){
  res.sendFile(__dirname+'index.html');
})
console.log("listened to 80");

io.on('connection', function (socket) {
  console.log('connected');
  socket.on('disconnect', function(){
    console.log('disconnected');
  });
  socket.on('message',function(msg){
    socket.emit(msg)
    console.log('recived'+msg);
  });
});  
