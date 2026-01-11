import { WebSocketServer,WebSocket } from "ws";
import {createClient} from "redis"
import { Publisher } from "./Publisher";


export const client= createClient()
const wss=new WebSocketServer({port:8080});

async function startServer() {
await client.connect();
await Publisher.getInstance().RedisSub()
wss.on("connection", (ws: WebSocket) => {
    Publisher.getInstance().addSocket(ws);

    ws.on("close", () => {
      Publisher.getInstance().disconnect(ws);
    });
  });
}
startServer().catch(err=>console.log(err))