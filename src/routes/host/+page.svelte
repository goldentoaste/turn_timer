<script lang="ts">
    import { browser } from "$app/environment";
    import { createRoom, joinRoom, dataChannels, cleanup } from "$lib/rtc";
    import { roomId } from "$lib/stores";

    import { onDestroy, onMount } from "svelte";

    let text = "test message";
    let receivedMessages: string[] = [];

    function connect() {
        createRoom().then(() => joinRoom($roomId));
    }

    dataChannels.subscribe((event) => {
        console.log("at host", $dataChannels);
        const delta = dataChannels.getDelta();
        for (const [key, channel] of Object.entries(delta)) {
            channel.onopen = (event) => {
                console.log(`${key} data channel opned`);
            };
            channel.onmessage = (e) => {
                if (e.data) {
                    receivedMessages = [
                        ...receivedMessages,
                        `${key} says: ${e.data}`,
                    ];
                }
            };
        }
    });

    function sendMsg() {
        receivedMessages = [...receivedMessages, `you said: ${text}`];
        for (const [_, channel] of Object.entries($dataChannels)) {
            console.log(`sending message: ${text}`);
            channel.send(text);
        }
    }

    onDestroy(() => {
        if (browser) cleanup();
    });
    
</script>


<style>
 
</style>
