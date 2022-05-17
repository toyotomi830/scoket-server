var script  = document.createElement('script');
  script.src  = '/socket.io/socket.io.js';
  script.type = 'text/javascript';
  script.defer = true;
  
document.getElementsByTagName('head').item(0).appendChild(script);
class Unchainable{
    constructor(user){
        this.user=user;
        this.socket = io();
        this.currentTopic=user.channelList.find(element=>element.default).name;
    }
    static async build(id){
        return new Promise(reslove=>{
            let url = new URL(document.location.origin+"/getUser");
            url.searchParams.append('id',id);
            fetch(url)
            .then(response => response.json())
            .then(json => {
                var user=json;
                console.log(user);
                console.log(window.localStorage.getItem('userid'));
                reslove(new Unchainable(user));
            })
        })
        
    }
    listen(callBack){
        this.user.channelList.forEach(channel => {
            this.socket.on(channel.name,msg=>{
                callBack(channel.name,msg)});
        });
    }
    publish(payload){
        this.socket.emit(this.currentTopic,{user:this.user,msg:payload});
    }
    setActive(topic,callBack){
        this.currentTopic=topic;
        callBack(topic,this);
    }
}

export {Unchainable};