import { writable } from 'svelte/store';

export const roomId = writable("");
export const playerId = writable("")
export const isHost = writable(false)


export const testVar = writable(100)