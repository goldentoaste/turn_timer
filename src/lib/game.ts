import { get, type Writable } from "svelte/store";
import { onAnyMessage, sendMsg } from "./messaging";
import { orderedPlayerId, players } from "./players";
import { gameStarted, globalState, playerId, prioPlayer, turnPlayer } from "./stores";
import { MessageTypes, type PassInfo, type PauseTime, type PlayerInfo, type StartGame } from "./types";

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
    // handling events that happens when the game window is open.
    else {
        const state = get(globalState)

        if (e.type === MessageTypes.PassTurn) {
            const info: PassInfo = e.content;

            
                if (info.targetId === state.currentPlayerId) {
                    // notify all other players that your turn is in fact starting
                    startTurn()
                }
            
        }

        if (e.type === MessageTypes.StartTurn) {
            const playerInfo: PlayerInfo = e.content;

            players[playerInfo.id] = playerInfo;
            state.prioPlayer.set(playerInfo.id)
            state.turnPlayer.set(playerInfo.id)
        }

        if (e.type === MessageTypes.TakePrio) {
            const playerInfo: PlayerInfo = e.content;

            players[playerInfo.id] = playerInfo;
            state.prioPlayer.set(playerInfo.id)
        }

        if (e.type === MessageTypes.PauseTime){
            const content : PauseTime = e.content;
            state.pauseTime = content.pause;
        }

    }
})

function initGame() {
    // reset each player's time
    for (const player of Object.values(players)) {
        player.reserveTime = reserveTime;
        player.bonusTime = bonusTime;
        player.clutchTime = 0;
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
    makeStates()
    gameStarted.set(true)
}

function passTurn() {
    const state = get(globalState)
    const playerId = state.currentPlayerId;
    const targetId = state.orderedPlayerIds[(state.orderedPlayerIds.indexOf(playerId) + 1) % state.orderedPlayerIds.length];

    console.log('passing turn from', playerId, "passing to", targetId);
    state.prioPlayer.set(targetId)
    state.turnPlayer.set(targetId)
    sendMsg({
        type: MessageTypes.PassTurn,
        origin: playerId,
        content: {
            targetId
        }
    })
}

function startTurn() {
    const state = get(globalState)
    const playerId = state.currentPlayerId;
    console.log("player starting turn", playerId)

    state.prioPlayer.set(playerId)
    state.turnPlayer.set(playerId)
    sendMsg(
        {
            type: MessageTypes.StartTurn,
            origin: playerId,
            content: state.players[playerId]
        }
    )
}

function takePrio() {
    const state = get(globalState)
    const playerId = state.currentPlayerId;
    console.log("player taking prio", playerId)
    state.prioPlayer.set(playerId)
    sendMsg(
        {
            type: MessageTypes.TakePrio,
            origin: playerId,
            content: state.players[playerId]
        }
    )
}






interface GameState {
    players?: { [id: string]: PlayerInfo };
    orderedPlayerIds?: string[],
    turnPlayer?: Writable<string>,
    prioPlayer?: Writable<string>,
    currentPlayerId?: string,
    reserveTime?: number,
    bonusTime?: number,
    clutchTime?: number,
    pauseTime?: boolean,
    takePrio?: ()=>void,
    passTurn?: ()=>void

    // add function to send msgs

}
function makeStates(): GameState {
    turnPlayer.set(orderedPlayerId[0])
    prioPlayer.set(orderedPlayerId[0])
    const res = {
        players: players,
        orderedPlayerIds: orderedPlayerId,
        turnPlayer: turnPlayer,
        prioPlayer: prioPlayer,
        currentPlayerId: get(playerId),
        reserveTime: reserveTime,
        bonusTime: bonusTime,
        clutchTime: clutchTime,
        pauseTime: false,
        passTurn,
        takePrio
    };
    globalState.set(
        res
    )

    return res
}

export {
    type GameState, makeStates, startGame
}

