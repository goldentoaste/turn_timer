<script lang="ts">
    import type { GameState } from "$lib/game";
    import { get, writable } from "svelte/store";
    import PlayerComp from "./playerComp.svelte";
    import Button from "$lib/components/Button.svelte";
    import { onMount } from "svelte";
    import type { PlayerInfo } from "$lib/types";
    import { fade } from "svelte/transition";


    let gameState: GameState;

    let gameState1 = {
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
    let player: PlayerInfo;
    let thisPlayerHasTurn = false;
    let thisPlayerHasPrio = false;
    let paused = true;
    let players: { [id: string]: PlayerInfo } = {};

    $: if (paused || !paused) {
        console.log("pause change", paused);
    }

    function rotatedArr(arr:Array<any>, index){
        return arr.slice(index).concat(arr.slice(0, index))
    }

    onMount(() => {
        gameState = window.opener.gameState;

        player = get(gameState.players)[gameState.currentPlayerId];

        thisPlayerHasTurn =
            player.id === get(gameState.turnPlayer) && !player.timedOut;
        gameState.turnPlayer.subscribe((newVal) => {
            thisPlayerHasTurn = player.id === newVal && !player.timedOut;
        });

        thisPlayerHasPrio =
            player.id === get(gameState.prioPlayer) && !player.timedOut;
        gameState.prioPlayer.subscribe((newVal) => {
            thisPlayerHasPrio = player.id === newVal && !player.timedOut;
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
            console.log("SETTING INTERVAL");

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
    });
</script>

{#if !gameState}
    <h1>Loading...</h1>
{:else}
    <div transition:fade>
        <div class="top">
            <div class="prioWrapper">
                <PlayerComp
                    {gameState}
                    isBig
                    player={players[get(gameState.prioPlayer)]}
                />
            </div>

            <div class="playerList">
                {#each rotatedArr(Object.keys(players), gameState.orderedPlayerIds.indexOf(get(gameState.prioPlayer))) as playerId}
                    {#if playerId !== get(gameState.prioPlayer)}
                        <PlayerComp {gameState} player={players[playerId]} />
                        <div class="divider" />
                    {/if}
                {/each}
            </div>
        </div>

        <div class="hGroup">
            <Button
                disabled={thisPlayerHasPrio || player.timedOut}
                on:click={() => {
                    gameState.takePrio();
                }}>Take Priority</Button
            >
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
                    ⏵︎ Unpause Time
                {:else}
                    ⏸︎ Pause Time
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
        padding: 1rem !important;
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
