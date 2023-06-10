import { get } from "svelte/store";
import { onAnyMessage, sendMsg } from "./messaging";
import { playerId, playersChanged } from "./stores";
import type { PlayerInfo } from "./types";

import { MessageTypes } from "./types";

const players: { [id: string]: PlayerInfo } = {}
const orderedPlayerId: string[] = []
onAnyMessage((msg) => {
    if (msg.type === MessageTypes.PlayerJoined) {
        const content: PlayerInfo = msg.content;
        addPlayer(content.id, content.name);
        const currentPlayerId = get(playerId);
        // when another player annouce their presence, respond.

        console.log("replying to player's annoucement", content.id);
        
        sendMsg({
            type: MessageTypes.PlayerJoined,
            origin: currentPlayerId,
            content: {
                id: currentPlayerId,
                name: players[currentPlayerId]
            }
        }, content.id)
    }
})


function addPlayer(id: string, name: string) {
    players[id] = {
        id: id,
        name: name,
        hasPrio: false,
        hasTurn: false,
        timeRemaining: 0
    }
    orderedPlayerId.push(id)
    playersChanged.set(!get(playersChanged))
}



export { players, orderedPlayerId, addPlayer }