import { EngineClient } from "..";

export class lastProcessedId{
    private static instance:lastProcessedId;
    private processedId;
   private constructor() {
    this.processedId='0-0'
   }


    public static getInstance():lastProcessedId{
        if(!lastProcessedId.instance) return lastProcessedId.instance=new lastProcessedId()
           return lastProcessedId.instance 
    }
    public setLastProcessedId(id:string){
        this.processedId=id;
    }
    public async getLastProcessedId(){
        const last_streamId:unknown=await EngineClient.get("lastProcessedStreamId")
        if(typeof last_streamId==="string"&&last_streamId!==null){
          this.processedId=last_streamId
          return this.processedId
        }
        return this.processedId
    }
}