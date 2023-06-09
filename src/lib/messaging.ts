import { dataChannels } from "./rtc";

import { get } from "svelte/store";


export function onMessage(callback: (msg: Message<any>) => void) {

    dataChannels.subscribe((event) => {
        console.log('subscribing to dataChannel');


        for (const [key, channel] of Object.entries(dataChannels.getDelta())) {
            console.log('subscribing to dataChannel');


            channel.onopen = (o) => console.log("client channel opened");
            channel.onclose = (o) => console.log("onclose");
            channel.onmessage = (msg) => {
                console.log(`received data from ${key}`, msg.data);
                if (msg.data) {

                    callback(JSON.parse(msg.data))
                }

            };
        }
    });
}

export function sendMsg(msg: object) {
    console.log('sending msg', msg);
    for (const [_, channel] of Object.entries(get(dataChannels))) {
        channel.send(JSON.stringify(msg));
    }
}