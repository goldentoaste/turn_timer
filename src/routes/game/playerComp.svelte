<script lang="ts">
    import type { PlayerInfo } from "$lib/types";
    import { get, type Writable } from "svelte/store";
    import HpBar from "./hpBar.svelte";
    import type { GameState } from "$lib/game";

    export let gameState: GameState;
    export let style = "";
    export let isBig = false;

    export let turnPlayerId; // bind this
    export let prioPlayerId; // bind this

    export let player: PlayerInfo;

    let playerHasTurn = false;
    let playerHasPrio = false;

    $: playerHasTurn = turnPlayerId === player.id;
    $: playerHasPrio = prioPlayerId === player.id;

    function getTimeStr(time: number): string {
        return `${~~(time / 60)}:${time % 60 < 10 ? 0 : ""}${time % 60}`;
    }

    let colors = ["blue", "red", "yellow", "green", "orange", "purple"];
</script>

<div
    class="playerParent"
    class:prioPlayer={player.id === prioPlayerId}
    {style}
    class:isBig
    class:notPrio={!playerHasPrio && prioPlayerId != turnPlayerId && !isBig}
    class:challenge={!playerHasTurn && playerHasPrio}
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
                <p style={playerHasPrio?"color:var(--red);":""}>{player.name}</p>
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
        hide={!playerHasPrio && prioPlayerId != turnPlayerId && !isBig}
    />
</div>

<style>
    .timeOut {
        filter: brightness(0.5) !important;
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

        transition-property: padding, margin, filter, border;
        transition-duration: 0.5s;
        transition-timing-function: ease-out;
    }

    .notPrio {
        padding: 0.25rem 0.75rem;
        margin: 0.25rem 0.5rem;
        filter: opacity(0.8);
    }
    .prioPlayer {
        border: var(--red) solid 2px;
    }
    .challenge {
        padding-top: 1rem;
        padding-bottom: 1rem;
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
