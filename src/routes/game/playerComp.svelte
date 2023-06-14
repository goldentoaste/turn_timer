<script lang="ts">
    import { bonusTime, clutchTime, turnPlayer } from "$lib/stores";
    import type { PlayerInfo } from "$lib/types";
    import { get, type Writable } from "svelte/store";
    import HpBar from "./hpBar.svelte";
    import type { GameState } from "$lib/game";

    export let gameState: GameState;
    export let style = "";
    export let isBig = false;

    export let player: PlayerInfo;
    console.log(player);

    function getTimeStr(time: number): string {
        return `${~~(time / 60)}:${time % 60 < 10 ? 0 : ""}${time % 60}`;
    }

    let colors = ["blue", "red", "yellow", "green", "orange", "purple"];
</script>

<div
    class="playerParent"
    class:turnPlayer={player.id === get(gameState.turnPlayer)}
    {style}
    class:isBig
    class:timeOut={player.timedOut}
>
    <div class="stuff">
        <div
            class="circle"
            style="background-color: var(--{colors[
                gameState.orderedPlayerIds.indexOf(player.id) % colors.length
            ]});"
        />
        <div>
            {#if isBig}
                <h2>
                    {player.name}
                </h2>
            {:else}
                <p>{player.name}</p>
            {/if}

            <div class="centerAlign">
                {#key [player.bonusTime, player.reserveTime, player.clutchTime]}
                    <p class:largeFont={isBig}>
                        {getTimeStr(
                            player.bonusTime +
                                player.reserveTime +
                                player.clutchTime
                        )}
                    </p>
                {/key}
            </div>
        </div>
    </div>
    <HpBar
        bind:player
        {isBig}
        reserve={gameState.reserveTime}
        bonus={gameState.bonusTime}
        clutch={gameState.clutchTime}
    />
</div>

<style>
    .timeOut {
        filter: brightness(0.7);
        pointer-events: none;
    }

    .centerAlign {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
    .playerParent {
        min-width: 110px;
        padding: 0.75rem;
        display: flex;
        flex-direction: column;

        justify-content: left;

        background-color: var(--bg1);
        border: 2px solid var(--bg2);
        margin: 0.5rem;

        height: fit-content;
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
        padding: 2rem 1rem;
    }

    h2 {
        text-justify: center;
    }

    .circle {
        border: 2px solid var(--fg);
        border-radius: 50%;

        width: 1rem;
        height: 1rem;

        transition: background-color 0.4s ease-out;
        margin-right: 0.5rem;
    }

    .stuff {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .isBig > .stuff > .circle {
        margin: 0.25rem;
        margin-right: 0.5rem;
    }
    .isBig > .stuff {
        align-items: flex-start;
        margin-right: 1rem;
    }
</style>
