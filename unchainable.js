import {io} from "/socket.io/socketio.js"
class Unchainable{
    constructor(user){
        this.user=user;
        this.socket = io();
    }
    static async bulid(id){
        if(id==null){
            if(window.localStorage.getItem('userid')==null){
                fetch(document.location.origin+"/newUser")
                .then(response => response.json())
                .then(json => {
                    user=json;
                    console.log(user);
                    return Unchainable(user);
                  })
              }
              else{
                let url = new URL(document.location.origin+"/getUser");
                url.searchParams.append('id',id);
                fetch(url)
                .then(response => response.json())
                .then(json => {
                    user=json;
                    console.log(user);
                    console.log(window.localStorage.getItem('userid'));
                    return Unchainable(user);
                })
              }
        }
    }
    static listen(callBack){
        this.user.channelList.forEach(channel => {
            this.socket.on(channel,callBack(msg));
        });
    }
    static publish(topic,payload){
        this.socket.emit(topic,{user:user,msg:payload});
    }
}

export {Unchainable};