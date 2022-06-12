
var script  = document.createElement('script');
  script.src  = '/socket.io/socket.io.js';
  script.type = 'text/javascript';
  script.defer = true;
  
document.getElementsByTagName('head').item(0).appendChild(script);
class Unchainable{
    constructor(_id,user){
        this._id=_id
        this.user=user;
        this.socket = io();
        this.currentTopic=user.channelList.find(element=>element.default).name;
        this.socket.emit('connectack',this._id)
    }
    static async build(id){
        return new Promise(reslove=>{
            var url = new URL(document.location.origin+"/getUser");
            url.searchParams.append('id',id);
            fetch(url)
            .then(response => response.json())
            .then(json => {
                var user=json;
                console.log(user);
                reslove(new Unchainable(user._id,{id:user.id,name:user.name,channelList:user.channelList}));
            })
        })
        
    }
    listen(callBack){
        this.user.channelList.forEach(channel => {
            this.socket.on(channel.name,msg=>{
                callBack(channel.name,msg)});
        });
    }
    publish(payload,callBack){
        this.socket.emit(this.currentTopic,{user:this.user,msg:payload},(res)=>callBack(res));
    }
    setActive(topic,callBack){
        this.currentTopic=topic;
        callBack(topic,this);
    }
    getHistory(n,channel,callBack){
        var url= new URL(document.location.origin+"/getHistory");
        url.searchParams.append('page',n);
        url.searchParams.append('channel',channel);
        url.searchParams.append('id',this._id);
        fetch(url)
        .then(response=>response.json())
        .then(json=>{
            callBack(json);
        })
    }
}

export {Unchainable};