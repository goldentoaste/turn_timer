import { get, writable, type Writable } from "svelte/store";
import { onAnyMessage, sendMsg } from "./messaging";
import { orderedPlayerId, players } from "./players";
import { gameStarted, globalState, playerId, prioPlayer, turnPlayer } from "./stores";
import { MessageTypes, type PassInfo, type PauseTime, type PlayerInfo, type StartGame } from "./types";

import { bonusTime, bonusTimeStore, reserveTime, reserveTimeStore, clutchTime, clutchTimeStore } from './stores'


onAnyMessage((e) => {
    console.log("in game", e);

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
        console.log("STARTING GAME");

    }
    // handling events that happens when the game window is open.
    else if ([MessageTypes.PassTurn, MessageTypes.StartTurn, MessageTypes.TakePrio,
    MessageTypes.PauseTime,
    MessageTypes.TimedOut, "stuff"
    ].indexOf(e.type) >= 0) {
        const state = get(globalState)
        const playersInState = get(state.players)
        if (e.type === MessageTypes.PassTurn) {
            const info: PassInfo = e.content;
            if (info.targetId === state.currentPlayerId) {
                // notify all other players that your turn is in fact starting
                startTurn()
            }
        }

        if (e.type === MessageTypes.StartTurn) {
            const playerInfo: PlayerInfo = e.content;

            playersInState[playerInfo.id] = playerInfo;
            state.prioPlayer.set(playerInfo.id)
            state.turnPlayer.set(playerInfo.id)
        }

        if (e.type === MessageTypes.TakePrio) {
            const playerInfo: PlayerInfo = e.content;

            playersInState[playerInfo.id] = playerInfo;
            state.prioPlayer.set(playerInfo.id)
        }

        if (e.type === MessageTypes.PauseTime) {
            const content: PauseTime = e.content;
            console.log("received pause request", content.paused);
            
            state.timePaused.set(content.paused);
        }

        if (e.type === MessageTypes.TimedOut) {
            playersInState[e.origin] = e.content;
        }

        state.players.set(playersInState)

    }
}, "game")

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
    let players = get(state.players)

    for (let i = 1, start = (state.orderedPlayerIds.indexOf(playerId)); i < state.orderedPlayerIds.length; i++) {
        const index = (start + i) % ids.length;
        if (!players[ids[index]].timedOut) {
            targetId = ids[index];
            break;
        }
    }
    state.players.set(players)

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

    const players = get(state.players);
    const player = players[playerId];
    player.bonusTime = bonusTime;
    if (player.reserveTime <= 0) {
        player.clutchTime = clutchTime;
    }

    state.players.set(players)
    state.prioPlayer.set(playerId)
    state.turnPlayer.set(playerId)
    sendMsg(
        {
            type: MessageTypes.StartTurn,
            origin: playerId,
            content: player
        }
    )
}

function takePrio() {
    const state = get(globalState)
    const playerId = state.currentPlayerId;
    console.log("player taking prio", playerId)

    const players = get(state.players);
    const player = players[playerId];
    if (player.reserveTime <= 0) {
        player.clutchTime = clutchTime;
    }
    state.players.set(players)
    state.prioPlayer.set(playerId)
    sendMsg(
        {
            type: MessageTypes.TakePrio,
            origin: playerId,
            content: player
        }
    )
}


function toggleTime(pause = true) {
    const state = get(globalState);
    const playerId = state.currentPlayerId;
    console.log("pausing time", playerId);

    state.timePaused.set(pause);
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


    const players = get(state.players)
    players[playerId].timedOut = true;
    state.players.set(players)
    sendMsg({
        type: MessageTypes.TimedOut,
        origin: playerId,
        content: players[playerId]
    })
}

interface GameState {
    players?: Writable<{ [id: string]: PlayerInfo }>;
    orderedPlayerIds?: string[],
    turnPlayer?: Writable<string>,
    prioPlayer?: Writable<string>,
    currentPlayerId?: string,
    reserveTime?: number,
    bonusTime?: number,
    clutchTime?: number,
    timePaused?: Writable<boolean>,
    takePrio?: () => void,
    passTurn?: () => void,
    toggleTime?: (pause: boolean) => void,
    timeOut?: () => void

    // add function to send msgs

}
function makeStates(): GameState {
    turnPlayer.set(orderedPlayerId[0])
    prioPlayer.set(orderedPlayerId[0])
    const res = {
        players: writable(players),
        orderedPlayerIds: orderedPlayerId,
        turnPlayer: turnPlayer,
        prioPlayer: prioPlayer,
        currentPlayerId: get(playerId),
        reserveTime: reserveTime,
        bonusTime: bonusTime,
        clutchTime: clutchTime,
        timePaused: writable(true),
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

