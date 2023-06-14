import { dataChannels } from "./rtc";

import { get } from "svelte/store";
import type { Message } from "./types";


let callbacks :  ((msg: Message) => void)[] = []

export function onAnyMessage(callback: (msg: Message) => void, source="none") {
    console.log("in on any message", source);
    callbacks.push(callback)
    dataChannels.subscribe((event) => {
        for (const [_, channel] of Object.entries(dataChannels.getDelta())) {

            for(const call of callbacks){
                channel.subscribe((msg) => {
                    call(msg)
                })
            }
          
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