<script lang="ts">
    import type { PlayerInfo } from "$lib/types";

    export let player: PlayerInfo;
    export let reserve: number;
    export let bonus: number;

    export let isBig = false;
    export let hide = false;

    let normalTotal = reserve + bonus;
</script>

<div class="hpParent" class:isBig class:hide>
    <div
        class="reserve bar"
        style="background-color: var(--blue); width: {Math.round(
            (player.reserveTime / normalTotal) * 100
        )}%;"
    />
    <div
        class="bonus bar"
        style="background-color: var(--yellow); width: {Math.round(
            (player.bonusTime / normalTotal) * 100
        )}%;"
    />

    {#if player.bonusTime <= 0}
        <div
            class="clutch bar"
            style="background-color: var(--green); width: {Math.round(
                (player.clutchTime / normalTotal) * 100
            )}%;"
        />
    {/if}
</div>

<style>
    .hide {
        height: 0;
        overflow: hidden;
    }

    .bar {
        height: 3px;
        transition-property: height, width;
        transition-timing-function: ease-out;
        transition-duration: 0.4s;
        margin-top: 0.1rem;

       
    }

    .hpParent {
        width: 100%;
        display: flex;
        flex-direction: row;

        justify-content: left;
        background-color: var(--bg);
    }

    .isBig > .bar {
        height: 6px;
    }
</style>
