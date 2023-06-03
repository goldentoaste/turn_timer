import { writable } from 'svelte/store';

export const currentConnectionId = writable("");
export const comReady = writable(false)
export const channelReady = writable(false) 