<script lang="ts">
    import type { GameState } from "$lib/game";
    import { get, writable } from "svelte/store";
    import PlayerComp from "./playerComp.svelte";

    let gameState: GameState = {
        players: {
            "1": {
                id: "1",
                name: "player1",
                hasPrio: false,
                hasTurn: true,
                reserveTime: 100,
                bonusTime: 100,
                clutchTime: 0,
            },
            "2": {
                id: "2",
                name: "player2",
                hasPrio: true,
                hasTurn: false,
                reserveTime: 100,
                bonusTime: 200,
                clutchTime: 0,
            },
            "3": {
                id: "3",
                name: "player3",
                hasPrio: false,
                hasTurn: false,
                reserveTime: 100,
                bonusTime: 200,
                clutchTime: 0,
            },
        },
        orderedPlayerIds: ["1", "2", "3"],
        turnPlayer: writable("1"),
        prioPlayer: writable("2"),
        currentPlayerId: "1",
        reserveTime: 100,
        bonusTime: 200,
        clutchTime: 15,
    };

    console.log(Object.keys(gameState.players));
    
</script>

<div class="top">
    {#each Object.keys(gameState.players) as playerId}
        {#if playerId === get(gameState.prioPlayer)}
            <PlayerComp {gameState} isBig player={gameState.players[playerId]}/>
        {/if}
    {/each}

    <div class="playerList">
        {#each Object.keys(gameState.players) as playerId}
        
            {#if playerId !== get(gameState.prioPlayer)}
                <PlayerComp {gameState} player={gameState.players[playerId]}/>
            {/if}
    {/each}
    </div>
</div>

<style>
    .top {
        display: flex;
        flex-direction: row;
    }

    .playerList {
        display: flex;
        flex-direction: column;

        border-left: 2px solid var(--fg1);
        gap: 0.5rem;
    }
</style>
