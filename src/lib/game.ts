import { get } from "svelte/store";
import { onAnyMessage, sendMsg } from "./messaging";
import { orderedPlayerId, players } from "./players";
import { gameStarted, playerId } from "./stores";
import { MessageTypes, type StartGame } from "./types";

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

        gameStarted.set(true)
        initGame()
    }
})

function initGame() {
    // reset each player's time
    for (const player of Object.values(players)) {
        player.reserveTime = reserveTime;
        player.bonusTime = bonusTime;
        player.clutchTime = clutchTime;
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
    gameStarted.set(true)
    initGame()
}

