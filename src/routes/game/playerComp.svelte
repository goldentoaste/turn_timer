<script lang="ts">
    import { bonusTime, clutchTime, turnPlayer } from "$lib/stores";
    import type { PlayerInfo } from "$lib/types";
    import { get, type Writable } from "svelte/store";
    import HpBar from "./hpBar.svelte";
    import type { GameState } from "$lib/game";

    export let gameState: GameState;
    export let style = "";
    export let isBig = false;
  
    export  let player : PlayerInfo;
    console.log(player);
    
    function getTimeStr(time: number): string {
        return `${~~(time / 60)}:${time % 60 < 10 ? 0 : ""}${time % 60}`;
    }
</script>

<div
    class="playerParent"
    class:turnPlayer={player.id === get(gameState.turnPlayer)}
    {style}
    class:isBig
>
    {#if isBig}
        <h2>
            {player.name}
        </h2>
    {:else}
        <p>{player.name}</p>
    {/if}

    <div class="centerAlign">
        <p class:largeFont={isBig}>
            {getTimeStr(
                player.bonusTime + player.reserveTime + player.clutchTime
            )}
        </p>
        <HpBar
            {player}
            {isBig}
            reserve={gameState.reserveTime}
            bonus={gameState.bonusTime}
        />
    </div>
</div>

<style>
    .centerAlign {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .playerParent {
        padding: 0.5rem;
        display: flex;
        flex-direction: column;

        justify-content: left;
    }
    .turnPlayer {
        border: var(--red) solid 2px;
    }

    .largeFont {
        font-size: 3rem;
    }
    p {
        margin: 0;
    }
    h2 {
        margin: 0;
    }

    .isBig {
        justify-content: center;
        padding: 1rem;
    }

    .isBig > h2 {
        text-align: center;
    }
</style>
