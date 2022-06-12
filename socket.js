var app = require('express')();
var http = require('http').Server(app);
const Unchainable = require('./unchanable_server');
var unchain=new Unchainable(http);
var Turn=require('node-turn');
var server = new Turn({
  authMech: 'long-term',
  credentials: {
    admin: "admin"
  }
})
http.listen(80);
console.log("listened to 80");
unchain.init()
app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});
app.get('/channelList',function(req,res){
  res.sendFile(__dirname+'/server_data/channel.json');
});
app.get('/getUser',function(req,res){
  unchain.getUser(req.query.id)
    .then(user=>{
      res.send(user);
    })
})
app.get('/Unchainable.js',function(req,res){
  res.sendFile(__dirname+'/unchainable.js');
})

app.get('/getHistory',(req,res)=>{
  unchain.getHistory(req.query.n,req.query.channel,req.query.id)
    .then(history=>{
      res.send(history);
    })
})

/*app.get('/setting',function(req,res){
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
})*/



