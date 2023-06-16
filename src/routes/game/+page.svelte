<script lang="ts">
    import type { GameState } from "$lib/game";
    import { get, writable } from "svelte/store";
    import PlayerComp from "./playerComp.svelte";
    import Button from "$lib/components/Button.svelte";
    import { onMount } from "svelte";
    import type { PlayerInfo } from "$lib/types";
    import { fade } from "svelte/transition";

    let gameState: GameState;
    let player: PlayerInfo;
    let thisPlayerHasTurn = false;
    let thisPlayerHasPrio = false;
    let paused = true;
    let players: { [id: string]: PlayerInfo } = {};

    let prioPlayerId = "";
    let turnPlayerId = "";



    function rotatedArr(arr: Array<any>, index) {
        return arr.slice(index+1).concat(arr.slice(0, index));
    }

    onMount(() => {
        gameState = window.opener.gameState;

        player = get(gameState.players)[gameState.currentPlayerId];

        thisPlayerHasTurn =
            player.id === get(gameState.turnPlayer) && !player.timedOut;
        gameState.turnPlayer.subscribe((newVal) => {
            thisPlayerHasTurn = player.id === newVal && !player.timedOut;
            turnPlayerId = newVal;
        });

        thisPlayerHasPrio =
            player.id === get(gameState.prioPlayer) && !player.timedOut;
        gameState.prioPlayer.subscribe((newVal) => {
            thisPlayerHasPrio = player.id === newVal && !player.timedOut;
            prioPlayerId = newVal;
        });

        paused = get(gameState.timePaused);
        gameState.timePaused.subscribe((newVal) => {
            paused = newVal;
        });

        players = get(gameState.players);
        gameState.players.subscribe((newVal) => {
            players = newVal;
            player = players[gameState.currentPlayerId];
        });

        setInterval(() => {
            if (paused || !get(gameState.prioPlayer)) {
                return;
            }

            const tempPlayers = get(gameState.players);

            const prioPlayer = tempPlayers[get(gameState.prioPlayer)];

            if (prioPlayer.bonusTime > 0) {
                prioPlayer.bonusTime -= 1;
            } else if (prioPlayer.clutchTime > 0) {
                prioPlayer.clutchTime -= 1;
            } else if (prioPlayer.reserveTime > 0) {
                prioPlayer.reserveTime -= 1;
            } else {
                if (prioPlayer.id === player.id) {
                    gameState.timeOut();
                    gameState.passTurn();
                }
            }

 
            gameState.players.set(tempPlayers);
        }, 1000);


        setTimeout(()=>{
            gameState.requestToSync();
        }, 100)
    });
</script>


<svelte:head >
    <title>{player?player.name:"Loading"}</title>
</svelte:head>

{#if !gameState}
    <h1>Loading...</h1>
{:else}
    <div transition:fade>
        <div class="top">
            <div class="prioWrapper">
                <PlayerComp
                    {gameState}
                    isBig
                    player={players[turnPlayerId]}
                    {turnPlayerId}
                    {prioPlayerId}
                />
            </div>
            <div class="playerList">
                {#each rotatedArr(gameState.orderedPlayerIds, gameState.orderedPlayerIds.indexOf(turnPlayerId)) as playerId}
                        <PlayerComp
                            {gameState}
                            player={players[playerId]}
                            {turnPlayerId}
                            {prioPlayerId}
                        />
                        <div class="divider" />
                   
                {/each}
            </div>
        </div>

        <div class="hGroup">
            <Button
                disabled={player.timedOut || (thisPlayerHasTurn && thisPlayerHasPrio)}
                on:click={() => {
                    if (thisPlayerHasPrio) {
                        gameState.returnPrio();
                    } else {
                        gameState.takePrio();
                    }
                }}
            >
                {#if thisPlayerHasPrio}
                    Return Prio
                {:else}
                    Take Prio
                {/if}
            </Button>
            <Button
                disabled={!thisPlayerHasTurn || player.timedOut}
                on:click={() => {
                    gameState.passTurn();
                }}>Pass Turn</Button
            >
            <Button
                on:click={() => {
                    gameState.toggleTime(!paused);
                }}
            >
                {#if paused}
                    Resume Time
                {:else}
                    Stop Time
                {/if}
            </Button>
        </div>
    </div>
{/if}

<style>
    .prioWrapper {
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .top {
        display: flex;
        flex-direction: row;
        align-items: stretch;
    }

    .playerList {
        display: flex;
        flex-direction: column;

        padding-left: 1rem;
        margin-left: 1rem;
        border-left: 2px solid var(--fg1);
        gap: 0.5rem;

        justify-content: center;
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
        padding: 0.25rem !important;
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
