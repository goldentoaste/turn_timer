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


    
    onDestroy(()=>{
        if (browser)
        cleanup();
    })
</script>

<h1>Host page</h1>
<button on:click={connect}> Start Session </button>
{#if $roomId}
    <p>Current call id is: {$roomId}</p>
{:else}
    <p>Current call have not started yet.</p>
{/if}

<form id="input">
    <label for="input">Message to send:</label>
    <textarea bind:value={text} rows="5" />
    <button on:click={sendMsg} disabled={$roomId === ""}>Submit</button>
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
