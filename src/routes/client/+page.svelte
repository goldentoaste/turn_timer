<script lang="ts">
    import { joinChat, peerConnection } from "$lib/rtc";
    import { onMount } from "svelte";
    import { comReady } from "$lib/stores";
    let chatId;
    let message;

    let channel: RTCDataChannel = undefined;

    let receivedMessages: string[] = [];

    function sendMsg() {
        channel.send(message);
    }

    function join() {
        joinChat(chatId).then(() => {
            peerConnection.getStats().then((e) => {
                console.log(e);
            });
        });
    }

    $: if ($comReady) {
        console.log("come readu");
        peerConnection.ondatachannel = (e) => {
            console.log("on data channel at client");
            channel = e.channel;
            channel.onopen = (o) => console.log("client channel opened");
            channel.onclose = (o) => console.log("onclose");
            channel.onmessage = (msg) => {
                console.log("received data", msg.data);
                receivedMessages.push(msg.data);
                receivedMessages = receivedMessages;
            };
        };
    }
</script>

<h1>Client Page</h1>

<div class="content">
    <label for="callId">Chat id:</label>
    <input
        type="text"
        name="callId"
        id="callid"
        bind:value={chatId}
        disabled={channel !== undefined}
    />

    <button on:click={join} disabled={channel !== undefined}>Join Chat</button>

    <label for="message">Message to send:</label>
    <textarea
        name="message"
        id="message"
        cols="30"
        rows="5"
        bind:value={message}
    />
    <button on:click={sendMsg} disabled={channel === undefined}
        >Send Message</button
    >

    <p>Received message:</p>

    <div class="received">
        {#if receivedMessages.length == 0}
            No message received yet
        {/if}
        {#each receivedMessages as m, index}
            <p>
                #{index}: {m}
            </p>
        {/each}
    </div>
</div>

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
