<script lang="ts">
    import { browser } from "$app/environment";
    import Button from "$lib/components/Button.svelte";
    import InfoIcon from "$lib/components/infoIcon.svelte";
    import InputField from "$lib/components/inputField.svelte";
    import { createRoom, joinRoom, dataChannels, cleanup } from "$lib/rtc";
    import { roomId } from "$lib/stores";
    import { onDestroy, onMount } from "svelte";

    onDestroy(() => {
        if (browser) cleanup();
    });

    let reserveTime = "600";
    let bonusTime = "120";
    let clutchTime = "15";
</script>

<h1>Hosting a game</h1>
<div class="divider" />

<!-- /////////////////////////////////// -->

<h3>1. Create Room</h3>
<div class="hGroup">
    <Button on:click={createRoom}>
        <span>Create Room</span>
    </Button>
    <InputField bind:value={$roomId} disabled placeholder="Room code..." />
</div>

<!-- /////////////////////////////////// -->
<h3>2. Set game rules</h3>

<div class="hGroup">
    Reserve Time:
    <InputField bind:value={reserveTime} />
    <InfoIcon text={`'Reserved Time' is only given to the player once when the game starts.
    When a new round starts this time is not refreshed.
    `} />
</div>

<!-- /////////////////////////////////// -->
<style>
    .divider {
        height: 2px;
        background-color: var(--bg3);
        width: 100%;
    }
    .hGroup {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 1rem;
        gap: 1rem;
    }
</style>
