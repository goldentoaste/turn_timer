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

    let colors = ["blue-alt", "red", "purple", "green-alt", "orange", "yellow"];
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
    <div>
        <div class="stuff">
            <div
                class="circle"
                style="background-color: var(--{colors[
                    gameState.orderedPlayerIds.indexOf(player.id) %
                        colors.length
                ]});"
            />
            <div>
                {#if isBig}
                    <h2>
                        {player.name}
                    </h2>
                {:else}
                    <p style={playerHasPrio ? "color:var(--red);" : ""}>
                        {player.name}
                    </p>
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
            hide={!playerHasPrio && prioPlayerId != turnPlayerId && !isBig}
        />
    </div>
</div>

<style>
    p {
        transition: color 0.4s ease-out;
    }
    .timeOut {
        filter: brightness(0.2) !important;
        pointer-events: none;
    }

    .centerAlign {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }

    .playerParent {
        min-width: 110px;
        padding: 0.5rem;
        display: flex;
        flex-direction: column;

        justify-content: center;

        background-color: var(--bg1);
        border: 2px solid var(--bg2);
        margin: 0.5rem;

        height: fit-content;

        transition-property: padding, margin, filter, border;
        transition-duration: 0.3s;
        transition-timing-function: ease-out;
    }

    .notPrio {
        padding: 0.25rem 0.5rem;
        margin: 0.25rem 0.5rem;
        filter: opacity(0.5);
    }
    .prioPlayer {
        border: var(--red) solid 2px;
    }
    .challenge {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
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
        min-width:170px;
        justify-content: center;
        padding: 2rem 0.75rem;
    }

    h2 {
        text-justify: center;
    }

    .circle {
        border: 2px solid var(--fg);
        border-radius: 50%;

        width: 0.8rem;
        min-width: 0.8rem;
        height: 0.8rem;

        transition: background-color 0.4s ease-out;
        margin-right: 0.5rem;
    }

    .stuff {
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    :global(.isBig > .stuff > .circle) {
        margin: 0.25rem;
        margin-right: 0.5rem;
    }
    :global(.isBig > .stuff) {
        align-items: flex-start;
        margin-right: 1rem;
    }
</style>
