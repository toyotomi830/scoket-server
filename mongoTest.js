const {ObjectId} = require('mongodb/lib/bson');
const { MongoClient } = require('mongodb');
const {Timestamp} = require('mongodb');
const dbURL = "mongodb://127.0.0.1:27017/";
const dbClient=new MongoClient(dbURL);
async function  getChannelList(){
    await dbClient.connect();
    var channelCol=dbClient.db('testdb').collection('test');
    return new Promise(reslove=>{
        channelCol.insertOne({time:new Date()})
        reslove(channelCol.find().toArray());
    })
}
async function creatCollection(channels){
    dbClient.db('testdb').collection('test').findOne({_id:ObjectId('62861e4eeb39d0919ced83a4')},(err,res)=>{
                console.log(res.time);
            });
    }

getChannelList()
    .then(channels=>creatCollection(channels))