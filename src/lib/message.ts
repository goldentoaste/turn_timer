
// this file has types and json structures
// make all message have the following format:

`
type: <msg_type>,
content:{
    ...
}
`

interface Message<T> {
    type:string,
    content:T
}
// the "content" can be then modeled by a typescript interface.

// player info
// to be passed around before and during to sync up
// when player takes prio, send a player info to indicate
// also used to indicate if a player has lost.
interface PlayerInfo {
    name: string,
    id: string,
    hasPrio: boolean,
    hasTrun:boolean,
    timeRemaining: number // in seconds
}

// game rules
interface GameRules {
    reserveTime: number,
    bonusTime: number,
    clutchTime:number
}


// just a list of player ids ordered by their playing order.
interface PlayerOrder {
    players: string[]
}

// no info, to indicate game starts and clients should start keeping time.
interface GameStart{}


