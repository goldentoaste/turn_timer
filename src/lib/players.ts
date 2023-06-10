import { get } from "svelte/store";
import { onAnyMessage } from "./messaging";
import { playersChanged } from "./stores";



const players: { [id: string]: PlayerInfo } = {}
const orderedPlayerId: string[] = []
onAnyMessage((msg) => {
    if (msg.type === MessageTypes.PlayerJoined) {
        const content: PlayerInfo = msg.content;
        players[content.id] = {
            id: content.id,
            name: content.name,
            hasPrio: false,
            hasTurn: false,
            timeRemaining: 0
        }
        orderedPlayerId.push(content.id)
        playersChanged.set(!get(playersChanged))

    }
})


export { players, orderedPlayerId }