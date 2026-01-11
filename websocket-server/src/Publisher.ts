import { client } from ".";
import { WebSocket } from "ws";

export class Publisher{
    //will follow singleton pattern
    private socketMap=new Set<WebSocket>();
    private static instance:Publisher;
    private constructor(){}
    public static getInstance(){
        if(!Publisher.instance){
            return Publisher.instance=new Publisher();
        }
        return Publisher.instance;
    }
    public addSocket(ws:WebSocket){
    if(!this.socketMap.has(ws)){
        this.socketMap.add(ws)
    }
    }
    public async RedisSub(){
        try {
            const subClient=client.duplicate()
            await subClient.connect()
          await subClient.subscribe("trades",(message)=>{
            for(const socket of this.socketMap){
                if(socket.readyState===WebSocket.OPEN){
                    socket.send(message)
                }
            }
          })  
        } catch (error) {
          console.log('error while subscribing to redis channel')  
        }
    }
    public disconnect(ws:WebSocket){
       if(this.socketMap.has(ws)){
        this.socketMap.delete(ws)
       }
    }

}