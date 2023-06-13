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
        makeStates()
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

        if (e.type === MessageTypes.PauseTime) {
            const content: PauseTime = e.content;
            state.timePaused = content.pause;
        }

        if (e.type === MessageTypes.TimedOut) {

            state.players[e.origin] = e.content;
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
    let targetId = "";
    let ids = state.orderedPlayerIds;
    let players = state.players

    for (let i = 1, start = (state.orderedPlayerIds.indexOf(playerId)); i < state.orderedPlayerIds.length; i++) {
        const index = (start + i) % ids.length;
        if (!players[ids[index]].timedOut) {
            targetId = ids[index];
            break;
        }
    }

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


    const player = state.players[playerId];
    player.bonusTime = bonusTime;
    if (player.reserveTime <= 0) {
        player.clutchTime = clutchTime;
    }


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

    const player = state.players[playerId];
    if (player.reserveTime <= 0) {
        player.clutchTime = clutchTime;
    }
    state.prioPlayer.set(playerId)
    sendMsg(
        {
            type: MessageTypes.TakePrio,
            origin: playerId,
            content: state.players[playerId]
        }
    )
}


function toggleTime(pause = true) {
    const state = get(globalState);
    const playerId = state.currentPlayerId;
    console.log("pausing time", playerId);

    state.timePaused = pause;
    sendMsg(
        {
            type: MessageTypes.PauseTime,
            origin: playerId,
            content: {
                paused: pause
            }
        }
    )
}

function timeOut() {
    const state = get(globalState);
    const playerId = state.currentPlayerId;
    console.log("player timed out", playerId)

    state.players[playerId].timedOut = true;

    sendMsg({
        type: MessageTypes.TimedOut,
        origin: playerId,
        content: state.players[playerId]
    })
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
    timePaused?: boolean,
    takePrio?: () => void,
    passTurn?: () => void,
    toggleTime?: (pause:boolean) => void,
    timeOut?: () => void

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
        timePaused: false,
        passTurn,
        takePrio,
        toggleTime,
        timeOut
    };
    globalState.set(
        res
    )

    return res
}

export {
    type GameState, makeStates, startGame
}

