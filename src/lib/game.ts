import { get, type Writable } from "svelte/store";
import { onAnyMessage, sendMsg } from "./messaging";
import { orderedPlayerId, players } from "./players";
import { gameStarted, playerId, prioPlayer, turnPlayer } from "./stores";
import { MessageTypes, type PlayerInfo, type StartGame } from "./types";

import { bonusTime, bonusTimeStore, reserveTime, reserveTimeStore, clutchTime, clutchTimeStore } from './stores'


onAnyMessage((e) => {
    if (e.type === MessageTypes.StartGame) {
        const info: StartGame = e.content;
        orderedPlayerId.length = 0;
        for (const id of info.playerOrder) {
            orderedPlayerId.push(id)
        }
        reserveTimeStore.set(info.reserveTime + "")
        bonusTimeStore.set(info.bonusTime + "")
        clutchTimeStore.set(info.reserveTime + "")
        initGame()
        gameStarted.set(true)

    }
})

function initGame() {
    // reset each player's time
    for (const player of Object.values(players)) {
        player.reserveTime = reserveTime;
        player.bonusTime = bonusTime;
        player.clutchTime = 0;
        player.hasPrio = false;
        player.hasTurn = player.id === orderedPlayerId[0];
    }
}


function startGame() {
    // give playing order to every player.
    sendMsg(
        {
            type: MessageTypes.StartGame,
            origin: get(playerId),
            content: {
                reserveTime: reserveTime,
                bonusTime: bonusTime,
                clutchTime: clutchTime,
                playerOrder: orderedPlayerId
            }
        }
    )

    initGame()
    gameStarted.set(true)
}

interface GameState {
    players : {[id:string]: PlayerInfo};
    orderedPlayerIds : string[],
    turnPlayer: Writable<string>,
    prioPlayer: Writable<string>,
    currentPlayerId: string,
    reserveTime : number,
    bonusTime: number,
    clutchTime:number

    // add function to send msgs

}
function makeStates() : GameState{
    
    return {
        players : players,
        orderedPlayerIds: orderedPlayerId,
        turnPlayer: turnPlayer,
        prioPlayer: prioPlayer,
        currentPlayerId: get(playerId),
        reserveTime: reserveTime,
        bonusTime: bonusTime,
        clutchTime: clutchTime
    }
}

export {
    type GameState, makeStates, startGame
}