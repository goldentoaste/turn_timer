import { dataChannels } from "./rtc";

import { get } from "svelte/store";
import type { Message } from "./types";


export function onAnyMessage(callback: (msg: Message) => void) {

    dataChannels.subscribe((event) => {
        console.log('subscribing to dataChannel');
        for (const [key, channel] of Object.entries(dataChannels.getDelta())) {
            channel.subscribe((msg) => {
                callback(msg)
            })
        }
    });
}

export function sendMsg(msg: Message, target?: string) {

    if (target) {
        console.log("only sending message to target", target, msg);
        get(dataChannels)[target].send(JSON.stringify(msg))
    }

    console.log('sending msg to everyone', msg);
    for (const [_, channel] of Object.entries(get(dataChannels))) {
        channel.send(JSON.stringify(msg));
    }
}