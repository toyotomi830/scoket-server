const {ObjectId} = require('mongodb/lib/bson');

const {nanoid} = require('nanoid');
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');

const LINES=15;

class User{
    constructor(id,name='',channelList=new Array()){
        this.id = id;
        this.name = name;
        this.channelList = channelList;
    }
}
class Unchainable{
    constructor(http,dbURL="mongodb://127.0.0.1:27017/"){
        this.io = require('socket.io')(http);
        this.mongoDB = new MongoClient(dbURL);
        this.channelList = new Array();
        this.users = new Array();
    }
    async init(){
        await this.mongoDB.connect();
        this.channelList = await this.#readchannel()
        this.io.on('connection',socket=>this.#onconection(socket,this));
    }
    async #readchannel(){
        var channelCol = this.mongoDB.db('server_data').collection('channels');
        return new Promise((reslove,reject)=>{
            channelCol.find().toArray((err,res)=>{
                if(err) reject(err);
                res.forEach(async channel=>{
                    await this.mongoDB.db('server_data').createCollection(channel.name,{capped:true,size:52428800}).catch(e=>
                    {})
                })
                reslove(res);
            })
        })
    }
    #onconection(socket,obj){
        console.log(socket.id+'connected');
        socket.once('connectack',msg=>{
            obj.users.push({id:msg,socket:socket});
            var userCol = obj.mongoDB.db('server_data').collection('users');
            userCol.aggregate([
                {
                  '$match': {
                    '_id': new ObjectId(msg)
                  }
                }, {
                  '$lookup': {
                    'from': 'channels', 
                    'localField': 'channelList', 
                    'foreignField': '_id', 
                    'as': 'channelList'
                  }
                }
              ]).toArray((err,res)=>{
                if (err) throw err;
                res[0].channelList.forEach(channel=>{
                    socket.on(channel.name,function(msg,callback){
                        socket.broadcast.emit(channel.name,msg)
                        console.log(channel.name+'channel recived '+msg);
                        var chathistory=obj.mongoDB.db('server_data').collection(channel.name);
                        chathistory.insertOne({user:{id:res[0].id,name:res[0].name},msg:msg.msg})
                            .then((respond)=>{
                                callback(respond.insertedId.toString())
                            })
                    });
                })
            })
        })
    }

    getUser(id){
        return new Promise((reslove,reject)=>{
            var userCol = this.mongoDB.db('server_data').collection('users');
            if(ObjectId.isValid(id)){
                userCol.aggregate([
                    {
                      '$match': {
                        '_id': new ObjectId(id)
                      }
                    }, {
                      '$lookup': {
                        'from': 'channels', 
                        'localField': 'channelList', 
                        'foreignField': '_id', 
                        'as': 'channelList'
                      }
                    }
                  ]).toArray((err,res)=>{
                    if(err) reject(err)
                    if(res==null){
                        var user = new User(nanoid(8));
                        this.channelList.forEach(channel=>{
                            if(!channel.security)
                            user.channelList.push(channel._id);
                        })
                        userCol.insertOne(user)
                            .then((res)=>{
                                user._id=res.insertedId.toString();
                                user.channelList=this.channelList.filter(channel=>!channel.security);
                                reslove(user);
                            })
                    }
                    else{
                        res[0]._id=res[0]._id.toString()
                        reslove(res[0])
                    }
                  })
                
            
        }
        else{
                var user = new User(nanoid(8));
                this.channelList.forEach(channel=>{
                    if(!channel.security)
                    user.channelList.push(channel._id);
                })
                userCol.insertOne(user)
                    .then((res)=>{
                        user._id=res.insertedId.toString();
                        user.channelList=this.channelList.filter(channel=>!channel.security);
                        reslove(user);
                    })
            }
        })
    }
    addChannel(channel){
        return new Promise(reslove=>{
            var channelCol=this.mongoDB.db('server_data').collection('channels');
            var userCol=this.mongoDB.db('server_data').collection('users');
            channelCol.insertOne(channel)
                .then(res=>{
                    this.mongoDB.db('server_data').createCollection(channel.name,{capped:true,size:52428800}).catch(e=>
                        {})
                    if(!channel.security){
                        userCol.updateMany({},{$push:{channelList:res.insertedId}})
                        this.users.forEach(element=>{
                            element.socket.emit('newChannel',channel.name);
                            element.socket.on(channel.name,msg=>{
                                socket.broadcast.emit(channel.name,msg)
                                console.log(channel.name+'channel recived '+msg);
                                var chathistory=this.mongoDB.db('server_data').collection(channel.name);
                                chathistory.insertOne({user:{id:res.id,name:res.name},msg:msg.msg,time:new Date()})
                                
                            })
                        })
                    }
                    reslove();
                })
        })
    }
    getHistory(n,channel,id){
        return new Promise(reslove=>{
            this.mongoDB.db('server_data').collection('users').aggregate([
                {
                  '$match': {
                    '_id': new ObjectId(id)
                  }
                }, {
                  '$lookup': {
                    'from': 'channels', 
                    'localField': 'channelList', 
                    'foreignField': '_id', 
                    'as': 'channelList'
                  }
                }
              ]).toArray((err,res)=>{
                  if(err) throw err;
                  if(res==null) reslove(null)
                  else{
                      if(res[0].channelList.filter(ele=>ele.name==channel).length!=0){
                          this.mongoDB.db('server_data').collection(channel).find({_id:{$lt:new ObjectId(n)}}).sort({_id:-1}).limit(LINES).toArray((err,res)=>{
                            if(err) throw err;
                            reslove(res);
                        })
                      }
                      else reslove(null);
                  }
              })
            
        })
        
    }
}

module.exports = Unchainable;