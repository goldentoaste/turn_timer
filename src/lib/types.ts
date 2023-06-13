
// this file has types and json structures
// make all message have the following format:

`
type: <msg_type>,
content:{
    ...
}
`




const enum MessageTypes {
    PlayerJoined = "player_joined", // has player info
    PlayerInfoResponse = "player_response",
    StartGame = "start_game",
    PassTurn = "pass_turn",
    TakePrio = "take_prio",
    StartTurn = "start_turn", // when received start turn, send info to all other players to sync up
    PauseTime = "pause_time",
    TimedOut = "time_out"

}

interface Message {
    type: string,
    origin: string,
    content: any
}
// the "content" can be then modeled by a typescript interface.

// player info
// to be passed around before and during to sync up
// when player takes prio, send a player info to indicate
// also used to indicate if a player has lost.
interface PlayerInfo {
    name: string,
    id: string,

    reserveTime?: number,
    bonusTime?: number,
    clutchTime?: number,
    timedOut?: boolean 
}

// game rules, player order, and to indicate starting game.
interface StartGame {
    reserveTime: number,
    bonusTime: number,
    clutchTime: number,
    playerOrder: string[],
}

interface PassInfo {
    targetId: string
}

interface PauseTime {
    pause: boolean
}


export { MessageTypes, type Message, type PlayerInfo, type StartGame, type PassInfo, type PauseTime }