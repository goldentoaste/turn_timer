<script lang="ts">
    import type { PlayerInfo } from "$lib/types";

    export let player: PlayerInfo;
    export let reserve: number;
    export let bonus: number;
    export let clutch: number;
    export let isBig = false;
    export let hide = false;

    let total = reserve + bonus;

    $: if (player.clutchTime > 0) {
        total = reserve + bonus + clutch;
    } else {
        total = reserve + bonus;
    }
</script>

<div class="hpParent" class:isBig class:hide>
    <div
        class="reserve bar"
        style="background-color: var(--blue); width: {Math.round(
            (player.reserveTime / total) * 100
        )}%;"
    />
    <div
        class="bonus bar"
        style="background-color: var(--yellow); width: {Math.round(
            (player.bonusTime / total) * 100
        )}%;"
    />

    <div
        class:hide
        class="clutch bar"
        style="background-color: var(--green); width: {Math.round(
            (player.clutchTime / total) * 100
        )}%;"
    />
</div>

<style>
    .hide {
        height: 0 !important;
        overflow: hidden;
        background-color: transparent !important;
    }

    .bar {
        height: 3px;
        transition-property: width;
        transition-timing-function: ease-out;
        transition-duration: 0.4s;
        margin-top: 0.1rem;
    }

    .hpParent {
        width: 100%;
        height: 3px;
        display: flex;
        flex-direction: row;

        justify-content: left;
        background-color: var(--bg);
        transition: height 0.4s ease-out;
    }

    .isBig > .bar {
        height: 6px;
    }

    .isBig {
        height: 6px;
    }
</style>
