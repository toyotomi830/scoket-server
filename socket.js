var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const mongoDB = require('mongodb').MongoClient;
const dbURL = "mongodb://localhost:27017/test"
const res = require('express/lib/response');
const {nanoid} = require('nanoid');
const fs = require("fs");
class User{
  constructor(){
    this.id = nanoid(8);
    this.name = '';
    this.channelList = '';
  }
}
var users = new Array();
let channelStr=fs.readFileSync(__dirname+'/server_data/channel.json');
let channel = JSON.parse(channelStr);
let usersStr = fs.readFileSync(__dirname+'/server_data/user.json');
let security = JSON.parse(fs.readFileSync(__dirname+'/server_config/security.json'));
if(usersStr!='')
  users=JSON.parse(usersStr);
http.listen(80);
app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});
app.get('/channelList',function(req,res){
  res.sendFile(__dirname+'/server_data/channel.json');
});
app.get('/getUser',function(req,res){
  var user = users.find(element => element.id==req.query.id);
  if(user==undefined){
    var newUser=new User();
    newUser.id=(req.query.id!='null')?req.query.id:newUser.id;
    console.log(newUser);
    var channelList=new Array();
    channel.forEach(element => {
      if(!element.security){
        channelList.push(element);
      }
    });
    newUser.channelList=channelList
    users.push(newUser);
    user=newUser;
    var data=JSON.stringify(users,null,'\t');
    fs.writeFile(__dirname+'/server_data/user.json',data,{flag:'w+'},err=>{if(err!=null)console.log(err);})
  }
  res.send(user);
})
app.get('/Unchainable.js',function(req,res){
  res.sendFile(__dirname+'/unchainable.js');
})
app.get('/setting',function(req,res){
  if(req.query.password==undefined){
    res.sendFile(__dirname+'/setting.html');
  }
  else if(req.query.password==security.password){
    switch (req.query.type) {
    case 'addChannel':
      if(channel.find(element => element.name==req.query.name)==undefined){
        var newChannel={
                    'name': req.query.name,
                    'default': req.query.default=='true',
                    'security': req.query.security=='true'
                  };
        channel.push(newChannel);
        var data=JSON.stringify(channel,null,'\t');
        fs.writeFile(__dirname+'/server_data/channel.json',data,{flag:'w+'},err=>{console.log(err);});
        res.send('channel '+newChannel.name+' added');
      }
      else{
        res.send('channel '+req.query.name+' already exist!');
      }
      break;
    case 'removeChannel':
      if(channel.find(element => element.name==req.query.name)==undefined){
        res.send('channel '+req.query.name+' unexist!');
      }
      else{
        channel = channel.filter(element => element.name!=req.query.name);
        var data=JSON.stringify(channel,null,'\t');
        users.forEach(element=>{
          element.channelList.filter(element => element.name!=req.query.name);
        })
        fs.writeFile(__dirname+'/server_data/channel.json',data,{flag:'w+'},err=>{console.log(err);});
        data=JSON.stringify(users,null,'\t')
        fs.writeFile(__dirname+'/server_data/user.json',data,{flag:'w+'},err=>{if(err!=null)console.log(err);})
        res.send('channel '+req.query.name+' removed!');
      }
      break;
    case 'addUserChannel':
      var user=users.find(element => element.id==req.query.id);
      if(user==undefined){
        res.send('user '+req.query.id+' unexist');
      }
      else if(channel.find(element=>element.name==req.query.name)==undefined){
        res.send('channel'+req.query.name+'unexist');
      }
      else{
        user.channelList.push({
                                'name': req.query.name,
                                'default': req.query.default,
                                'security': req.query.security
                              })
        users=users.filter(element => element.id!=req.query.id);
        users.push(user);
        var data=JSON.stringify(users,null,'\t')
        fs.writeFile(__dirname+'/server_data/user.json',data,{flag:'w+'},err=>{if(err!=null)console.log(err);})
        res.send('channel '+req.query.name+'add to user'+req.query.id);
      }
      break;
    case 'checkPassword':
      res.send(true)
      break;
    default:
      res.send('command unexist!');
      break;
    }
  }else{
    if(req.query.type=='checkPassword')
      res.send(false)
    else
      res.send('worng passworld')
  }
})

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
