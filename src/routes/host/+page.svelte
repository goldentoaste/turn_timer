<script lang="ts">
    import Button from "$lib/components/Button.svelte";
    import InfoIcon from "$lib/components/infoIcon.svelte";
    import InputField from "$lib/components/inputField.svelte";
    import PlayerList from "$lib/components/playerList.svelte";
    import { startGame } from "$lib/game";
    import { orderedPlayerId, players } from "$lib/players";
    import { createRoom, joinRoom, dataChannels } from "$lib/rtc";
    import { cleanup } from "$lib/cleanUp";
    import {
        playerId,
       
        roomId,
        bonusTimeStore,
        clutchTimeStore,
        reserveTimeStore,

        globalState,
    } from "$lib/stores";

    let playerName = "";
    $reserveTimeStore = "480";
    $bonusTimeStore = "120";
    $clutchTimeStore = "20";

    function open() {
        // @ts-ignore
        window.gameState = $globalState;
        window.open(
            "/game",
            "Game Window",
            `scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,
width=520,height=350,left=500,top=500`
        );
    }
</script>

<svelte:window on:beforeunload={cleanup} />
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
<p>
    Note: when effects are resolving, no player's time should tick down.
    <br />
    Time should tick during when players are thinking/deciding what to play.
</p>
<div class="rules">
    <span>Reserve Time:</span>
    <InputField
        bind:value={$reserveTimeStore}
        suffix="seconds"
        pattern={"[1-9][0-9]{0,3}"}
    />
    <InfoIcon
        text={`'Reserved Time' is only given to the player once when the game starts.
    When a new round starts this time is not refreshed.
    `}
    />
    <span>Bonus Time:</span>
    <InputField
        bind:value={$bonusTimeStore}
        suffix="seconds"
        pattern={"[1-9][0-9]{0,3}"}
    />
    <InfoIcon
        text={`'Bonus Time' is refreshed whenever the player's turn starts.`}
    />

    <span>Clutch Time:</span>
    <InputField
        bind:value={$clutchTimeStore}
        suffix="seconds"
        pattern={"[1-9][0-9]{0,3}"}
    />
    <InfoIcon
        text={`'Clutch Time' is given when any player who has run out of Reserve Time takes 
    priority, so they will have at least clutch + bonus time. The intention is to 
    always allow players to react and take prio regardless how large their time pool is.
    `}
    />
</div>

<!-- /////////////////////////////////// -->

<h3>3.Invite other players</h3>
<p>
    Get other players to join by sending them the code.<br />
    Players that have joined will show in the list below. <br />
    You can pick a name and join the lobby too now.
</p>

<div class="hGroup">
    <InputField bind:value={playerName} placeholder="Player name..." />
    <Button
        disabled={$roomId.length == 0 ||
            ($playerId.length > 0 && players[$playerId] !== undefined)}
        on:click={() => {
            joinRoom($roomId, playerName);
        }}
    >
        <span>Join Lobby</span>
    </Button>
</div>

<!-- /////////////////////////////////// -->
<PlayerList canArrange={true} />

<p>
    If all players has joined, arrange the players into the correct playing
    order, then click on start.
</p>

<div class="hGroup">
    <Button
        style="margin:2rem 1rem; margin-left:0;"
        on:click={() => {
            startGame();
            open();
        }}
    >
        <h2>Start game</h2>
    </Button>
    <Button on:click={open}>Open game window</Button>
</div>

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

    .rules {
        display: inline-grid;
        grid-template-columns: auto auto auto;
        align-items: center;
        gap: 0.5rem;
    }

    h2 {
        margin: 0.5rem;
    }
</style>

