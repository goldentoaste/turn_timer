<script lang="ts">
    import type { PlayerInfo } from "$lib/types";

    export let player: PlayerInfo;
    export let reserve: number;
    export let bonus: number;
    export let clutch : number;
    export let isBig = false;

    let normalTotal = reserve + bonus;
</script>

<div class="hpParent" class:isBig>

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
            (player.clutchTime / (bonus)) * 100
        )}%;"
    />
{/if}
</div>

<style>
    .bar {
        height: 3px;
        transition: width 0.4s ease-out;
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
