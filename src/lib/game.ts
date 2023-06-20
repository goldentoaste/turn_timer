import { get, writable, type Writable } from "svelte/store";
import { onAnyMessage, sendMsg } from "./messaging";
import { addPlayer, deletedUserIndex, deletedUsers, orderedPlayerId, players } from "./players";
import { gameStarted, globalState, isHost, playerId, prioPlayer, turnPlayer } from "./stores";
import { MessageTypes, type Message, type PassInfo, type PauseTime, type PlayerInfo, type StartGame } from "./types";

import { bonusTime, bonusTimeStore, reserveTime, reserveTimeStore, clutchTime, clutchTimeStore } from './stores'

console.log("running game.ts");



function startGameAsClient(e: Message){
    const info: StartGame = e.content;
    orderedPlayerId.length = 0;
    for (const id of info.playerOrder) {
        orderedPlayerId.push(id)
    }
    reserveTimeStore.set(info.reserveTime + "");
    bonusTimeStore.set(info.bonusTime + "");
    clutchTimeStore.set(info.reserveTime + "");
    initGame();
    makeStates();
    gameStarted.set(true);
}
onAnyMessage(
    (e) => {
        console.log("received message in game", e.type);

        if (e.type === MessageTypes.StartGame) {
         startGameAsClient(e);
        }
        // handling events that happens when the game window is open.
        else if (get(gameStarted)) {
            const state = get(globalState)
            let playersInState = get(state.players)
            const playerInfo: PlayerInfo = e.content;


            switch (e.type) {
                case MessageTypes.PassTurn:
                    const info: PassInfo = e.content;
                    if (info.targetId === state.currentPlayerId) {
                        // notify all other players that your turn is in fact starting
                        startTurn()
                    }
                    break;
                case MessageTypes.StartTurn:
                    playersInState[playerInfo.id] = playerInfo;
                    state.prioPlayer.set(playerInfo.id);
                    state.turnPlayer.set(playerInfo.id);
                    break;

                case MessageTypes.TakePrio:
                    playersInState[playerInfo.id] = playerInfo;
                    state.prioPlayer.set(playerInfo.id)
                    break;

                case MessageTypes.PauseTime:
                    const content: PauseTime = e.content;
                    state.timePaused.set(content.paused);
                    break;
                case MessageTypes.TimedOut:
                    playersInState[e.origin] = e.content;;
                    break;
                case MessageTypes.ReturnPrio:
                    console.log("received return prio");

                    takePrio();
                    break;
                case MessageTypes.Disconnect:
                    const origin = e.origin;
                    if (get(isHost)) {
                        // cache disconnected players
                        deletedUsers[origin] = e.content;
                        deletedUserIndex[origin] = orderedPlayerId.indexOf(origin);
                    }

                    // remove this player from play dict
                    delete playersInState[origin]
                    // and player order.
                    orderedPlayerId.splice(orderedPlayerId.indexOf(origin), 1);
                    state.orderedPlayerIds = orderedPlayerId;
                    break;

                case MessageTypes.ReuqestToSync:
                    if (get(isHost)) {
                        const sender = e.origin;
                        sendMsg(
                            {
                                type: MessageTypes.SyncResponse,
                                origin: state.currentPlayerId,
                                content: get(state.players),
                            },
                            sender
                        )
                    }
                    break;
                case MessageTypes.SyncResponse:
                    playersInState = e.content;
                    break;

                case MessageTypes.PlayerJoined:
                    if (get(isHost)) {
                        const incomingId = e.origin;
                        // this player disconnected previously
                        if (deletedUsers[incomingId] !== undefined) {


                            const oldPlayer = deletedUsers[incomingId];
                            const oldPlayerIndex = deletedUserIndex[incomingId];

                            players[incomingId] = oldPlayer;
                            orderedPlayerId.splice(oldPlayerIndex, 0, incomingId);

                            playersInState[incomingId] = oldPlayer;
                            state.orderedPlayerIds = orderedPlayerId;

                            sendMsg(
                                {
                                    type: MessageTypes.RestoreDisconnection,
                                    origin: state.currentPlayerId,
                                    content: {
                                        order: orderedPlayerId,
                                        player: oldPlayer
                                    }
                                }
                            )
                        }
                        else {
                            // add new player
                            addPlayer(playerInfo.id, playerInfo.name)
                            const addedPlayer = players[playerInfo.id];
                            addedPlayer.bonusTime = state.bonusTime;
                            addedPlayer.reserveTime = state.reserveTime;
                            playersInState[addedPlayer.id] = addedPlayer;
                            state.orderedPlayerIds = orderedPlayerId;

                            sendMsg(
                                {
                                    type: MessageTypes.PlayerJoinMidGame,
                                    origin: state.currentPlayerId,
                                    content: addedPlayer
                                }
                            )
                        }
                    }
                    break;

                case MessageTypes.RestoreDisconnection:
                    const restoredPlayer = e.content["player"];
                    const order = e.content["order"]

                    playersInState[restoredPlayer.id] = restoredPlayer;
                    state.orderedPlayerIds = order;
                    break;
                case MessageTypes.PlayerJoinMidGame:

                // TODO if current player *is* the one that joined,
                // request for game rules from host.    
                    addPlayer(playerInfo.id, playerInfo.name)
                    const addedPlayer = players[playerInfo.id];
                    playersInState[addedPlayer.id] = addedPlayer;
                    state.orderedPlayerIds = orderedPlayerId;
                    break;
                default:
                    break;
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

function requestToSync() {
    sendMsg(
        {
            type: MessageTypes.ReuqestToSync,
            origin: get(playerId),
            content: {}
        }
    )
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

    state.prioPlayer.set(targetId)
    state.turnPlayer.set(targetId)
    sendMsg({
        type: MessageTypes.PassTurn,
        origin: playerId,
        content: {
            targetId
        }
    }, targetId)
}

function startTurn() {
    const state = get(globalState)
    const playerId = state.currentPlayerId;


    const players = get(state.players);
    const player = players[playerId];
    player.bonusTime = bonusTime;

    player.clutchTime = 0;


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


    const players = get(state.players);
    const player = players[playerId];
    if (player.bonusTime <= 0) {
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



function returnPrio() {
    const state = get(globalState);
    const playerId = state.currentPlayerId;

    const turnPlayerId = get(state.turnPlayer);

    state.prioPlayer.set(turnPlayerId)

    // only send it back to the turn player
    sendMsg({
        type: MessageTypes.ReturnPrio,
        origin: playerId,
        content: {}
    }, turnPlayerId)
}


function toggleTime(pause = true) {
    const state = get(globalState);
    const playerId = state.currentPlayerId;


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
function disconnect() {
    const state = get(globalState);
    const playerId = state.currentPlayerId;

    sendMsg(
        {
            type: MessageTypes.Disconnect,
            origin: playerId,
            content: get(state.players)[playerId]
        }
    )
}
function timeOut() {
    const state = get(globalState);
    const playerId = state.currentPlayerId;

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
    timeOut?: () => void,
    returnPrio?: () => void,
    requestToSync?: () => void
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
        timeOut,
        returnPrio,
        requestToSync
    };
    globalState.set(
        res
    )

    return res
}

export {
    type GameState, makeStates, startGame, disconnect
}

