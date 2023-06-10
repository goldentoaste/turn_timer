<script>
    import { orderedPlayerId, players } from "$lib/players";
    import { playersChanged } from "$lib/stores";

    export let canArrange = false;

    let colors = ["blue", "red", "yellow", "green", "orange", "purple"];
</script>

<h3>Player List</h3>
<div class="playerContainer">
    {#key playersChanged}
        {#each orderedPlayerId as id, index (id)}
            <div class="playerItem">
                <div
                    class="cirle"
                    style="background-color: var(--{colors[
                        index % colors.length
                    ]});"
                />
                <h4>{players[id].name}</h4>

                <div class="handle">
                    <div class="bar" />
                    <div class="bar" />
                    <div class="bar" />
                </div>
            </div>
        {/each}
    {/key}
</div>

<style>
    .playerContainer {
        border: var(--bg2) 2px solid;
        min-width: 400px;

        display: flex;
        flex-direction: column;
    }

    .circle {
        border: 2px solid var(--bg3);
        border-radius: 50%;

        width: 2rem;
        height: 2rem;
    }
    h4 {
        color: var(--fg);
    }

    .playerItem {
        border: var(--bg3) 2px solid;
        padding: 0.5rem;
        margin: 0.5rem;
    }
</style>
