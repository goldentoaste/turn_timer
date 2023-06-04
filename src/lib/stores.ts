import { writable } from 'svelte/store';

export const roomId = writable("");
export const comReady = writable(false)
export const channelReady = writable(false) 