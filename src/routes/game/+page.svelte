<script lang="ts">
    import type { GameState } from "$lib/game";
    import { get, writable } from "svelte/store";
    import PlayerComp from "./playerComp.svelte";
    import Button from "$lib/components/Button.svelte";

    let gameState: GameState = {
        players: {
            "1": {
                id: "1",
                name: "player1",

                reserveTime: 100,
                bonusTime: 100,
                clutchTime: 0,
            },
            "2": {
                id: "2",
                name: "player2",
            
                reserveTime: 100,
                bonusTime: 200,
                clutchTime: 0,
            },
            "3": {
                id: "3",
                name: "player3",
          
                reserveTime: 100,
                bonusTime: 200,
                clutchTime: 0,
            },
            "4": {
                id: "4",
                name: "player4",
             
                reserveTime: 100,
                bonusTime: 200,
                clutchTime: 0,
            },
        },
        orderedPlayerIds: ["1", "2", "3", "4"],
        turnPlayer: writable("1"),
        prioPlayer: writable("2"),
        currentPlayerId: "1",
        reserveTime: 100,
        bonusTime: 200,
        clutchTime: 15,
    };
    let player = gameState.players[gameState.currentPlayerId];
    let thisPlayerHasTurn = false;
    let thisPlayerHasPrio = false;
    gameState.turnPlayer.subscribe((newVal) => {
        thisPlayerHasTurn = player.id === newVal;
    });

    gameState.prioPlayer.subscribe((newVal) => {
        thisPlayerHasPrio = player.id === newVal;
    });
</script>

<div class="top">
    {#each Object.keys(gameState.players) as playerId}
        {#if playerId === get(gameState.prioPlayer)}
            <PlayerComp
                {gameState}
                isBig
                player={gameState.players[playerId]}
            />
        {/if}
    {/each}

    <div class="playerList">
        {#each Object.keys(gameState.players) as playerId}
            {#if playerId !== get(gameState.prioPlayer)}
                <PlayerComp {gameState} player={gameState.players[playerId]} />
                <div class="divider" />
            {/if}
        {/each}
    </div>
</div>

<div class="hGroup">
    <Button disabled={thisPlayerHasPrio}>Take Priority</Button>
    <Button disabled={!thisPlayerHasTurn}>Pass Turn</Button>
</div>

<style>
    .top {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .playerList {
        display: flex;
        flex-direction: column;

        padding-left: 1rem;
        margin-left: 1rem;
        border-left: 2px solid var(--fg1);
        gap: 0.5rem;
    }

    .divider {
        height: 2px;
        width: auto;
        background-color: var(--bg1);
    }

    .divider:last-child {
        display: none;
    }

    :global(body) {
        padding: 1rem;
    }

    .hGroup {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 1rem;
        gap: 1rem;

        border-top: 2px solid var(--fg1);
        padding-top: 1rem;
    }
</style>
