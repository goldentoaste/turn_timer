import { get } from "svelte/store";
import { onAnyMessage, sendMsg } from "./messaging";
import { gameStarted, playerId, playersChanged } from "./stores";
import type { PlayerInfo } from "./types";

import { MessageTypes } from "./types";

const players: { [id: string]: PlayerInfo } = {}
const orderedPlayerId: string[] = []
const deletedUsers : { [id: string]: PlayerInfo } = {}
const deletedUserIndex : {[id:string]: number} = {}

onAnyMessage((msg) => {
    console.log("received message in player", msg);
    if(get(gameStarted)){
        return;
    }
    
    if (msg.type === MessageTypes.PlayerJoined || msg.type === MessageTypes.PlayerInfoResponse) {
        const content: PlayerInfo = msg.content;

        addPlayer(content.id, content.name);
    }
}, "player")


function addPlayer(id: string, name: string) {
    players[id] = {
        id: id,
        name: name,
        reserveTime:0,
        bonusTime:0,
        clutchTime:0,
        timedOut :false
    }
    orderedPlayerId.push(id)
    playersChanged.set(!get(playersChanged));
}



export { players, orderedPlayerId, deletedUsers, addPlayer,deletedUserIndex }