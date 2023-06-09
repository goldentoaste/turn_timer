<script lang="ts">
    import { joinRoom, dataChannels } from "$lib/rtc";
    import { onMount } from "svelte";

    let roomId: string;
    let message;
    let connected = false;

    let receivedMessages: string[] = [];

    function sendMsg() {
        receivedMessages = [...receivedMessages, `you said: ${message}`];
        for (const [_, channel] of Object.entries($dataChannels)) {
            console.log(`sending message: ${message}`);

            channel.send(message);
         
        }
    }

    function join() {
        if (roomId) {
            joinRoom(roomId).then((e) => (connected = true));
        }
    }

    dataChannels.subscribe((event) => {
        console.log("at client", $dataChannels);

        for (const [key, channel] of Object.entries(dataChannels.getDelta())) {
            console.log("on data channel at client");

            channel.onopen = (o) => console.log("client channel opened");
            channel.onclose = (o) => console.log("onclose");
            channel.onmessage = (msg) => {
                console.log(`received data from ${key}`, msg.data);

                receivedMessages = [
                    ...receivedMessages,
                    `${key} says: ${msg.data}`,
                ];
            };
        }
    });
</script>



<style>
    .content {
        display: flex;
        flex-direction: column;
        max-width: 500px;
    }

    .received {
        display: flex;
        flex-direction: column;
        border: black 2px solid;
        padding: 1rem;
        width: 500px;
        height: 600px;
    }
</style>
