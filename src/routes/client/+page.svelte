<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import InputField from "$lib/components/inputField.svelte";
    import PlayerList from "$lib/components/playerList.svelte";
    import { players } from "$lib/players";
    import { joinRoom, dataChannels } from "$lib/rtc";
    import { roomId, playerId, gameStarted, globalState } from "$lib/stores";
    import {disconnect} from '$lib/game'

    let playerName = "";

    function open(){
        // @ts-ignore
        window.gameState = $globalState;
        window.open("/game","Game Window", `scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,
        width=520,height=350,left=500,top=500`)
    }
</script>
<svelte:window on:beforeunload={disconnect} />
<h1>
    Joining a game
</h1>


<p>Pick your player name and paste in room id to join.</p>
<div class="hGroup">
    <InputField bind:value={playerName} placeholder="Player name..." />
    <InputField bind:value={$roomId} placeholder="Room id..." />
    <Button
        disabled={$roomId.length == 0 ||
            playerName.length == 0 ||
            ($playerId.length > 0 && players[$playerId] !== undefined)}
        on:click={() => {
            joinRoom($roomId, playerName);
        }}
    >
        <span>Join Lobby</span>
    </Button>
</div>

<Button disabled={!$gameStarted} on:click={open}>
    Start Game
</Button>

<h3>
    Player List
</h3>
<p>
    Players who are already in the lobby will be displayed here once you connect. <br/>
    Rules, player order, decided when the host starts the game, and will not be displayed here for now. :^(
</p>

<PlayerList canArrange={false}/>

<style>
    .hGroup {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 1rem;
        gap: 1rem;
    }
</style>
