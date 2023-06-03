<script lang="ts">
    import { connectToSignalServer, peerConnection ,dataChannel} from "$lib/rtc";
    import { currentConnectionId } from "$lib/stores";
    import { onMount } from "svelte";
    import { comReady, channelReady } from "$lib/stores";
    let text = "test message";
    let receivedMessages: string[] = [];

    let channel

    function connect() {
        connectToSignalServer();
    }

    function sendMsg() {
        console.log("sending message: ", text)
        dataChannel.send(text, );
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

    $: if ($channelReady) {
        console.log("come readu");
     

            dataChannel.onopen = (o) => console.log("host channel opened");
            dataChannel.onclose = (o) => console.log("onclose");

            dataChannel.onmessage = (msg) => {
                console.log(msg.data);
                receivedMessages.push(msg.data);
                receivedMessages = receivedMessages;
            };
        
    }
</script>

<h1>Host page</h1>

<button on:click={connect}  disabled={dataChannel !== undefined}> Start Session </button>
{#if $currentConnectionId}
    <p>Current call id is: {$currentConnectionId}</p>
{:else}
    <p>Current call have not started yet.</p>
{/if}

<form id="input">
    <label for="input">Message to send:</label>
    <textarea bind:value={text} rows="5" />
    <button on:click={sendMsg} disabled={dataChannel === undefined}>Submit</button>
</form>

<p>Received messages</p>
<div class="received">
    {#if !receivedMessages.length}
        No message received yet
    {/if}
    {#each receivedMessages as m, index}
        <p>
            #{index}: {m}
        </p>
    {/each}
</div>

<style>
    form {
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
