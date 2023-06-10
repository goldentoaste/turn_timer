import { dataChannels } from "./rtc";

import { get } from "svelte/store";


export function onAnyMessage(callback: (msg: Message<any>) => void) {

    dataChannels.subscribe((event) => {
        console.log('subscribing to dataChannel');
        for (const [key, channel] of Object.entries(dataChannels.getDelta())) {
            channel.subscribe((msg) => {
                callback(msg)
            })
        }
    });
}

export function sendMsg(msg: object) {
    console.log('sending msg', msg);
    for (const [_, channel] of Object.entries(get(dataChannels))) {
        channel.send(JSON.stringify(msg));
    }
}