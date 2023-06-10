import { get } from "svelte/store";
import { onAnyMessage, sendMsg } from "./messaging";
import { orderedPlayerId } from "./players";
import { playerId } from "./stores";
import { MessageTypes, type PlayerOrder } from "./types";




onAnyMessage((e)=>{
    if(e.type === MessageTypes.PlayerOrder){
        const order : PlayerOrder= e.content;
        orderedPlayerId.length
        for (const id of order.players){

        }
    }
})


function startGame(){
    // give playing order to every player.
    sendMsg(
        {
            type: MessageTypes.PlayerOrder,
            origin:get(playerId),
            content: orderedPlayerId
        }
    )
}