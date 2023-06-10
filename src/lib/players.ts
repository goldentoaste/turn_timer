import { get } from "svelte/store";
import { onAnyMessage } from "./messaging";
import { playersChanged } from "./stores";
import type { PlayerInfo } from "./types";

import { MessageTypes } from "./types";

const players: { [id: string]: PlayerInfo } = {}
const orderedPlayerId: string[] = []
onAnyMessage((msg) => {
    if (msg.type === MessageTypes.PlayerJoined) {
        const content: PlayerInfo = msg.content;
        addPlayer(content.id, content.name)
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