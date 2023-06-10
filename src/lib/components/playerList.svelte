<script lang="ts">
    import { orderedPlayerId, players } from "$lib/players";
    import { playersChanged } from "$lib/stores";

    import { flip } from "svelte/animate";
    import { dndzone } from "svelte-dnd-action";

    export let canArrange = false;

    let colors = ["blue", "red", "yellow", "green", "orange", "purple"];

    let playerItems: { id: String; code: string }[] = [];

    $: if ($playersChanged || !$playersChanged) {
        for (const id of orderedPlayerId) {
            if (playerItems.every((item) => item.code !== id)) {
                playerItems.push({
                    id: `${playerItems.length}`,
                    code: id,
                });
                playerItems = playerItems;
            }
        }
    }

    function onConsider(e) {
        playerItems = e.detail.items;
    }
    function onFinalize(e) {
        console.log(e);
        playerItems = e.detail.items;
        orderedPlayerId.length = 0;

        for (const item of playerItems) {
            orderedPlayerId.push(item.code);
        }
    }
</script>

<h3>Player List</h3>
{#key playersChanged}
    <div
        class="playerContainer"
        use:dndzone={{
            items: playerItems,
            flipDurationMs: 300,
            dragDisabled: !canArrange,
            dropTargetStyle: {},
        }}
        on:consider={onConsider}
        on:finalize={onFinalize}
    >
        {#each playerItems as item, index (item.id)}
            <div class="playerItem" animate:flip={{ duration: 300 }}>
                <div
                    class="circle"
                    style="background-color: var(--{colors[
                        index % colors.length
                    ]});"
                />
                <h4>{players[item.code].name}</h4>

                <div class="handle">
                    <div class="bar" />
                    <div class="bar" />
                    <div class="bar" />
                </div>
            </div>
        {/each}
    </div>
{/key}

<style>
    .playerContainer {
        border: var(--bg2) 2px solid;
        min-width: 400px;

        display: flex;
        flex-direction: column;

        width: fit-content;
    }

    .circle {
        border: 2px solid var(--fg);
        border-radius: 50%;

        width: 1rem;
        height: 1rem;

        transition: background-color 0.4s ease-out;
    }

    h4 {
        all: unset;
        color: var(--fg1);
    }

    .playerItem {
        border: var(--bg3) 2px solid;
        padding: 0.5rem;
        margin: 0.5rem;

        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;

        padding: 1rem;
    }
</style>
