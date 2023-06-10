import { writable } from 'svelte/store';

export const roomId = writable("");
export const playerId = writable("")
export const isHost = writable(false)
export const testVar = writable(100)

export const playersChanged = writable(false)
export const gameStarted = writable(false)

export const reserveTimeStore = writable("0")
export const bonusTimeStore = writable("0")
export const clutchTimeStore = writable("0")

export let reserveTime = 0;
reserveTimeStore.subscribe((val) => {
    reserveTime = Number.parseInt(val)
})
export let bonusTime = 0;
bonusTimeStore.subscribe((val) => {
    bonusTime = Number.parseInt(val)
})
export let clutchTime = 0;
clutchTimeStore.subscribe((val) => {
    clutchTime = Number.parseInt(val)
})


export const turnPlayer = writable("")
export const prioPlayer = writable("")