var http = require('http').createServer(handler);
var app = require('express')();
var io = require('socket.io')(http);
const res = require('express/lib/response');
var fs = require('fs');

http.listen(80);
app.get('/',function(req,res){
  res.sendFile(__dirname+'index.html');
})
console.log("listened to 80");
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on('connection', function (socket) {
  console.log('connected');
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('disconnect', function(){
    console.log('disconnected');
  });
  socket.on('message',function(msg){
    socket.emit('message',msg);
    console.log('recived'+msg);
  });
});  
